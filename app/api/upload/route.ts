import { NextRequest, NextResponse } from 'next/server';
import { extractPdfTextWithPages, transcribeScannedDocument } from '@/lib/pdf';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 60; // Allow sufficient time for OCR / large files

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = checkRateLimit(ip, 30);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before uploading again.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const isPasted = formData.get('isPasted') === 'true';
    const pastedText = formData.get('pastedText') as string | null;

    // Handle pasted text
    if (isPasted && pastedText) {
      if (pastedText.trim().length < 20) {
        return NextResponse.json(
          { error: 'Pasted text must be at least 20 characters long.' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        text: pastedText.trim(),
        pages: [pastedText.trim()],
        totalPages: 1,
        isScanned: false,
        fileName: 'Pasted Text Document',
      });
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file was provided in the upload request.' },
        { status: 400 }
      );
    }

    // 15 MB limit validation
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: 'File exceeds the maximum allowed size of 15 MB.' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'document';
    const mimeType = file.type || 'application/pdf';

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // Magic bytes verification
    const isPdfMagic =
      uint8.length >= 4 &&
      uint8[0] === 0x25 &&
      uint8[1] === 0x50 &&
      uint8[2] === 0x44 &&
      uint8[3] === 0x46; // %PDF
    const isPngMagic =
      uint8.length >= 8 &&
      uint8[0] === 0x89 &&
      uint8[1] === 0x50 &&
      uint8[2] === 0x4e &&
      uint8[3] === 0x47; // \x89PNG
    const isJpgMagic =
      uint8.length >= 3 && uint8[0] === 0xff && uint8[1] === 0xd8 && uint8[2] === 0xff; // \xFF\xD8\xFF
    const isWebpMagic =
      uint8.length >= 12 &&
      uint8[0] === 0x52 &&
      uint8[1] === 0x49 &&
      uint8[2] === 0x46 &&
      uint8[3] === 0x46 &&
      uint8[8] === 0x57 &&
      uint8[9] === 0x45 &&
      uint8[10] === 0x42 &&
      uint8[11] === 0x50; // RIFF....WEBP

    // Check if PDF
    if (isPdfMagic || mimeType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      const extracted = await extractPdfTextWithPages(arrayBuffer);

      // If PDF text is very small (likely scanned pages or images in PDF), run OCR
      if (extracted.isScanned || extracted.text.trim().length < 50) {
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const transcribed = await transcribeScannedDocument(base64, 'application/pdf');
        return NextResponse.json({
          text: transcribed.text,
          pages: transcribed.pages,
          totalPages: transcribed.totalPages,
          isScanned: true,
          fileName,
        });
      }

      return NextResponse.json({
        text: extracted.text,
        pages: extracted.pages,
        totalPages: extracted.totalPages,
        isScanned: false,
        fileName,
      });
    }

    // Check if Image (JPG/PNG/WEBP)
    if (
      isPngMagic ||
      isJpgMagic ||
      isWebpMagic ||
      mimeType.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp)$/i.test(fileName)
    ) {
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const resolvedMime = isPngMagic
        ? 'image/png'
        : isJpgMagic
          ? 'image/jpeg'
          : isWebpMagic
            ? 'image/webp'
            : mimeType;
      const transcribed = await transcribeScannedDocument(base64, resolvedMime);
      return NextResponse.json({
        text: transcribed.text,
        pages: transcribed.pages,
        totalPages: transcribed.totalPages,
        isScanned: true,
        fileName,
      });
    }

    // Plain text / markdown
    if (mimeType.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const text = Buffer.from(arrayBuffer).toString('utf-8');
      return NextResponse.json({
        text,
        pages: [text],
        totalPages: 1,
        isScanned: false,
        fileName,
      });
    }

    return NextResponse.json(
      { error: 'Unsupported file format. Please upload a PDF, JPG, PNG, or text file.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: 'Unable to process document file. Please ensure it is a valid PDF or image.' },
      { status: 500 }
    );
  }
}

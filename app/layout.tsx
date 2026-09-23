import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  themeColor: '#1F5F5B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'ClauseWise - Understand Your Agreement Before You Sign It',
  description:
    'A calm, friendly guide for non-lawyers to understand contracts, find hidden traps, and ask smart questions. Legal information, not legal advice.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'ClauseWise - Understand Your Agreement Before You Sign It',
    description:
      'A calm, friendly guide for non-lawyers to understand contracts, find hidden traps, and ask smart questions.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClauseWise - AI Legal Document Assistant',
    description: 'Understand, compare, and question legal agreements with confidence.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${devanagari.variable}`}>
      <body
        className="font-sans antialiased bg-background text-text min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

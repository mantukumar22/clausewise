import { GoogleGenAI } from '@google/genai';
import { env } from '@/lib/env';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export function getGeminiModel(): string {
  return env.GEMINI_MODEL;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(err: unknown): boolean {
  if (!err) return false;
  const errorObj = err as Record<string, unknown>;
  const msg =
    typeof err === 'string' ? err : typeof errorObj.message === 'string' ? errorObj.message : '';
  const status =
    errorObj.status ||
    errorObj.code ||
    (errorObj.error as Record<string, unknown> | undefined)?.code ||
    '';
  const errorStatus = (errorObj.error as Record<string, unknown> | undefined)?.status || '';
  const combined = `${msg} ${status} ${errorStatus} ${String(err)}`.toLowerCase();

  return (
    combined.includes('503') ||
    combined.includes('429') ||
    combined.includes('unavailable') ||
    combined.includes('high demand') ||
    combined.includes('resource_exhausted') ||
    combined.includes('rate limit') ||
    combined.includes('overloaded') ||
    combined.includes('temporarily')
  );
}

/**
 * Execute Gemini generateContent with automatic retry and multi-model fallback
 * for 503 high-demand or rate-limit spikes.
 */
export async function generateContentWithRetry(
  params: Parameters<GoogleGenAI['models']['generateContent']>[0]
) {
  const ai = getGeminiClient();
  const primaryModel = params.model || getGeminiModel();

  // Model cascade in priority order: start with primaryModel, then fall back immediately to flash-lite / flash-latest
  const modelCandidates = Array.from(
    new Set([primaryModel, 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'])
  );

  let lastError: unknown = null;

  for (let mIdx = 0; mIdx < modelCandidates.length; mIdx++) {
    const candidate = modelCandidates[mIdx];

    // Up to 2 attempts per candidate with backoff
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await ai.models.generateContent({
          ...params,
          model: candidate,
        });
      } catch (err: unknown) {
        lastError = err;
        const isTransient = isTransientError(err);

        if (!isTransient) {
          // If it's a permanent error (like syntax, prompt format, or auth), don't retry blindly
          throw err;
        }

        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(
          `[Gemini Retry] Model ${candidate} attempt ${attempt} failed with transient error: ${errMsg}. Backing off...`
        );

        if (attempt < 2) {
          // Jittered backoff (800ms to 1400ms)
          await sleep(800 + Math.random() * 600);
        } else if (mIdx < modelCandidates.length - 1) {
          // Pause briefly before switching to next candidate model
          await sleep(500);
        }
      }
    }
  }

  throw lastError;
}

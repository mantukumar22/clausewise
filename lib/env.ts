import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required').default(''),
  GEMINI_MODEL: z
    .string()
    .trim()
    .regex(/^(gemini|veo|lyria)-[a-zA-Z0-9_.-]+$/i, 'Invalid GEMINI_MODEL format')
    .default('gemini-3.1-flash-lite'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const rawModel = process.env.GEMINI_MODEL?.trim() || '';
const validModelRegex = /^(gemini|veo|lyria)-[a-zA-Z0-9_.-]+$/i;
const safeModel = validModelRegex.test(rawModel) ? rawModel : 'gemini-3.1-flash-lite';

let parsedEnv: z.infer<typeof envSchema>;

try {
  parsedEnv = envSchema.parse({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_MODEL: safeModel,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    NODE_ENV: process.env.NODE_ENV,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorDetails = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Environment validation failed: ${errorDetails}`);
  }
  throw error;
}

export const env = parsedEnv;

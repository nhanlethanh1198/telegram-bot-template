import zod from "zod/v4";

const envSchema = zod.object({
  TELEGRAM_BOT_TOKEN: zod.string().min(1).max(255),
});

export function validateEnv(
  env: Record<string, string | undefined>,
): zod.core.$ZodIssue[] {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    return result.error.issues;
  }
  return [];
}

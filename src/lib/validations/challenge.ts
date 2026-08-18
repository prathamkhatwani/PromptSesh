import { z } from "zod";

export const submitChallengeSchema = z.object({
  promptText: z
    .string()
    .trim()
    .min(5, "Please write your prompt instructions before submitting (min 5 characters).")
    .max(15000, "Prompt exceeds maximum allowed length of 15,000 characters."),
  modelId: z.string().trim().default("gemini-2.0-flash").optional(),
  crossModel: z.boolean().default(false).optional(),
});

export const rubricCriterionSchema = z.object({
  name: z.string().trim().min(1, "Criterion name is required."),
  description: z.string().trim().min(1, "Criterion description is required."),
  weight: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((n) => !isNaN(n) && n > 0 && n <= 100, "Weight must be between 1 and 100."),
});

export const createChallengeSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(200),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]),
  categoryId: z.string().trim().min(1, "Category ID is required."),
  systemPrompt: z.string().trim().max(10000).optional().nullable(),
  starterPrompt: z.string().trim().max(10000).optional().nullable(),
  testInputs: z.array(z.record(z.string(), z.any())).optional().default([]),
  constraints: z.string().optional().default(""),
  hints: z.array(z.string()).optional().default([]),
  isPremium: z.boolean().optional().default(false),
  rubricCriteria: z.array(rubricCriterionSchema).optional().default([]),
});

export type SubmitChallengeInput = z.infer<typeof submitChallengeSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;

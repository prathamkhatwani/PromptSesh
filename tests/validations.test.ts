import { describe, it, expect } from "vitest";
import { signupSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { submitChallengeSchema, createChallengeSchema } from "@/lib/validations/challenge";

describe("Zod Validation Suite", () => {
  describe("Auth Schemas", () => {
    it("should accept valid signup payloads", () => {
      const valid = { name: "Alice Developer", email: "alice@example.com", password: "SecurePassword123!" };
      const result = signupSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject short passwords in signup", () => {
      const invalid = { email: "alice@example.com", password: "short" };
      const result = signupSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should normalize email to lowercase in forgotPasswordSchema", () => {
      const result = forgotPasswordSchema.safeParse({ email: "  User@Domain.COM  " });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@domain.com");
      }
    });

    it("should reject invalid reset tokens in resetPasswordSchema", () => {
      const result = resetPasswordSchema.safeParse({ token: "123", newPassword: "NewPassword123!" });
      expect(result.success).toBe(false);
    });
  });

  describe("Challenge Schemas", () => {
    it("should validate valid prompt submission", () => {
      const payload = {
        promptText: "Extract all key metrics into a valid table format with headers.",
        modelId: "llama-3.3-70b",
        crossModel: true,
      };
      const result = submitChallengeSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject prompt submissions that are too short", () => {
      const payload = { promptText: "hi" };
      const result = submitChallengeSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("should validate and normalize valid challenge creation payload", () => {
      const payload = {
        title: "Deterministic SQL Generator",
        slug: "deterministic-sql-gen",
        description: "Build a zero-shot SQL prompt that adheres to Postgres 16 dialect.",
        difficulty: "HARD",
        categoryId: "cat-sql",
        rubricCriteria: [
          { name: "Postgres Syntax", description: "Must use valid PG16 dialect", weight: "50" },
          { name: "Injection Defense", description: "Must parameterize user variables", weight: 50 },
        ],
      };
      const result = createChallengeSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rubricCriteria?.[0]?.weight).toBe(50);
      }
    });

    it("should reject challenge creation with invalid slug characters", () => {
      const payload = {
        title: "Bad Slug Challenge",
        slug: "Bad Slug With Spaces!",
        description: "Challenge description here with enough characters.",
        difficulty: "EASY",
        categoryId: "cat-1",
      };
      const result = createChallengeSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});

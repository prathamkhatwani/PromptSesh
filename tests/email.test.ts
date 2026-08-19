import { describe, it, expect } from "vitest";
import { sendPasswordResetEmail } from "@/lib/email";

describe("Email Dispatch Service Suite", () => {
  it("should generate and dispatch an email payload with a valid reset url", async () => {
    const result = await sendPasswordResetEmail({
      to: "testuser@example.com",
      resetUrl: "http://localhost:3000/auth/reset-password?token=testtoken123",
    });

    expect(result.success).toBe(true);
    expect(["resend", "smtp", "ethereal-dev", "console-fallback"]).toContain(result.provider);
  }, 15000);
});

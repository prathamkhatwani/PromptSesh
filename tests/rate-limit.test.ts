import { describe, it, expect } from "vitest";
import { checkRateLimit, checkLoginRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";

describe("Rate Limiter Suite", () => {
  describe("getRateLimitIdentifier", () => {
    it("should prioritize authenticated userId over headers", () => {
      const mockReq = new Request("http://localhost:3000/api/test", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      const identifier = getRateLimitIdentifier(mockReq, "usr_12345");
      expect(identifier).toBe("user:usr_12345");
    });

    it("should extract the leftmost IP from x-forwarded-for when unauthenticated", () => {
      const mockReq = new Request("http://localhost:3000/api/test", {
        headers: { "x-forwarded-for": "198.51.100.42, 10.0.0.1" },
      });
      const identifier = getRateLimitIdentifier(mockReq, null);
      expect(identifier).toBe("ip:198.51.100.42");
    });

    it("should fall back to anonymous identifier if no IP headers exist", () => {
      const mockReq = new Request("http://localhost:3000/api/test");
      const identifier = getRateLimitIdentifier(mockReq, null);
      expect(identifier).toBe("ip:anonymous");
    });
  });

  describe("checkRateLimit Sliding Window", () => {
    it("should allow requests within the rate limit threshold", async () => {
      const id = `test-client-${Date.now()}-1`;
      const res1 = await checkRateLimit(id, 3, 5000);
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = await checkRateLimit(id, 3, 5000);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = await checkRateLimit(id, 3, 5000);
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it("should block requests exceeding the rate limit", async () => {
      const id = `test-client-${Date.now()}-2`;
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(id, 5, 5000);
      }
      const blockedRes = await checkRateLimit(id, 5, 5000);
      expect(blockedRes.success).toBe(false);
      expect(blockedRes.remaining).toBe(0);
    });
  });

  describe("checkLoginRateLimit Brute-Force Defense", () => {
    it("should throttle and lock out account after exceeding 5 login attempts", async () => {
      const email = `attacker_${Date.now()}@target.com`;
      for (let i = 0; i < 5; i++) {
        const attempt = await checkLoginRateLimit(email, 5, 5000);
        expect(attempt.success).toBe(true);
      }

      // 6th attempt should be blocked
      const blockedAttempt = await checkLoginRateLimit(email, 5, 5000);
      expect(blockedAttempt.success).toBe(false);
      expect(blockedAttempt.remaining).toBe(0);
    });

    it("should isolate lockout keys per distinct email", async () => {
      const emailA = `victim_a_${Date.now()}@domain.com`;
      const emailB = `victim_b_${Date.now()}@domain.com`;

      for (let i = 0; i < 5; i++) {
        await checkLoginRateLimit(emailA, 5, 5000);
      }

      const blockedA = await checkLoginRateLimit(emailA, 5, 5000);
      expect(blockedA.success).toBe(false);

      const allowedB = await checkLoginRateLimit(emailB, 5, 5000);
      expect(allowedB.success).toBe(true);
    });
  });
});

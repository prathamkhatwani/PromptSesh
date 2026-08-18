import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";

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
});

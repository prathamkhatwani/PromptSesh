import { describe, it, expect } from "vitest";
import { isUserAdmin, requireAdmin } from "@/lib/auth-guard";

describe("Production RBAC & Auth Guard Suite", () => {
  describe("isUserAdmin", () => {
    it("should return true for valid ADMIN role", () => {
      const session = { user: { role: "ADMIN", email: "admin@enterprise.org" } };
      expect(isUserAdmin(session)).toBe(true);
    });

    it("should return false for regular USER role", () => {
      const session = { user: { role: "USER", email: "user@domain.com" } };
      expect(isUserAdmin(session)).toBe(false);
    });

    it("should reject former backdoor email attempts without ADMIN role", () => {
      expect(isUserAdmin({ user: { role: "USER", email: "admin@promptcode.com" } })).toBe(false);
      expect(isUserAdmin({ user: { role: "USER", email: "admin@promptsesh.com" } })).toBe(false);
    });

    it("should return false for unauthenticated sessions", () => {
      expect(isUserAdmin(null)).toBe(false);
      expect(isUserAdmin(undefined)).toBe(false);
      expect(isUserAdmin({ user: null })).toBe(false);
    });
  });

  describe("requireAdmin Route Guard", () => {
    it("should return null (allow access) for verified ADMIN session", () => {
      const adminSession = { user: { role: "ADMIN", email: "admin@company.com" } };
      const result = requireAdmin(adminSession);
      expect(result).toBeNull();
    });

    it("should return 401 Unauthorized for missing session or unauthenticated user", async () => {
      const result = requireAdmin(null);
      expect(result).not.toBeNull();
      expect(result?.status).toBe(401);
      const json = await result?.json();
      expect(json.error).toContain("authentication required");
    });

    it("should return 403 Forbidden for non-admin authenticated users", async () => {
      const userSession = { user: { role: "USER", email: "candidate@promptsesh.com" } };
      const result = requireAdmin(userSession);
      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
      const json = await result?.json();
      expect(json.error).toContain("administrator privileges required");
    });
  });
});

import { describe, it, expect } from "vitest";

describe("RBAC & Security Authorization Suite", () => {
  function checkAdminAccess(session: { user?: { role?: string; email?: string } } | null): boolean {
    if (!session?.user) return false;
    // Strict role check without email backdoors
    return session.user.role === "ADMIN";
  }

  it("should grant access to users with ADMIN role", () => {
    const adminSession = {
      user: { role: "ADMIN", email: "legitadmin@company.org" },
    };
    expect(checkAdminAccess(adminSession)).toBe(true);
  });

  it("should deny access to regular USER role", () => {
    const userSession = {
      user: { role: "USER", email: "user@domain.com" },
    };
    expect(checkAdminAccess(userSession)).toBe(false);
  });

  it("should deny access to former hardcoded backdoor emails lacking ADMIN role", () => {
    const backdoorAttempt1 = {
      user: { role: "USER", email: "admin@promptcode.com" },
    };
    const backdoorAttempt2 = {
      user: { role: "USER", email: "admin@promptsesh.com" },
    };
    expect(checkAdminAccess(backdoorAttempt1)).toBe(false);
    expect(checkAdminAccess(backdoorAttempt2)).toBe(false);
  });

  it("should deny unauthenticated requests", () => {
    expect(checkAdminAccess(null)).toBe(false);
    expect(checkAdminAccess({})).toBe(false);
  });
});

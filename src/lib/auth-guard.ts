import { NextResponse } from "next/server";

export interface AuthSession {
  user?: {
    id?: string;
    email?: string | null;
    role?: string | null;
    name?: string | null;
  } | null;
}

/**
 * Validates if the given session has ADMIN privileges.
 * Strictly verifies role === "ADMIN" and forbids any email shortcuts or environment bypasses.
 */
export function isUserAdmin(session: AuthSession | null | undefined): boolean {
  if (!session?.user) {
    return false;
  }
  return session.user.role === "ADMIN";
}

/**
 * Enforces admin authorization for API route handlers.
 * Returns null if authorized, or a 401/403 NextResponse if unauthorized.
 */
export function requireAdmin(session: AuthSession | null | undefined): NextResponse | null {
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized — authentication required." },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden — administrator privileges required." },
      { status: 403 }
    );
  }

  return null;
}

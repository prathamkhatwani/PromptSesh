import * as Sentry from "@sentry/nextjs";

/**
 * Enterprise Observability & Error Tracking Module
 * 
 * Provides centralized error tracking, Sentry integration, and structured
 * logging across LLM pipelines, authentication, and database operations.
 */

const isSentryConfigured = Boolean(
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
);

if (isSentryConfigured) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    environment: process.env.NODE_ENV || "development",
  });
}

export interface ErrorContext {
  tags?: Record<string, string | number | boolean>;
  extra?: Record<string, any>;
  user?: { id?: string; email?: string; role?: string };
  level?: "info" | "warning" | "error" | "fatal";
}

/**
 * Captures exceptions and sends them to Sentry with structured metadata.
 */
export function captureError(error: unknown, context?: ErrorContext): void {
  const err = error instanceof Error ? error : new Error(String(error));

  if (isSentryConfigured) {
    Sentry.withScope((scope) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([k, v]) => scope.setTag(k, String(v)));
      }
      if (context?.extra) {
        Object.entries(context.extra).forEach(([k, v]) => scope.setExtra(k, v));
      }
      if (context?.user) {
        scope.setUser(context.user);
      }
      if (context?.level) {
        scope.setLevel(context.level);
      }
      Sentry.captureException(err);
    });
  }

  // Structured console fallback with ISO timestamp and context
  const timestamp = new Date().toISOString();
  console.error(`[OBSERVABILITY][ERROR][${timestamp}]`, err.message, {
    stack: err.stack,
    ...context,
  });
}

/**
 * Logs LLM execution telemetry for monitoring latency, token costs, and failures.
 */
export function logLLMTelemetry(data: {
  provider: string;
  model: string;
  latencyMs: number;
  tokenCount: number;
  success: boolean;
  error?: string;
}): void {
  const timestamp = new Date().toISOString();

  if (isSentryConfigured && !data.success) {
    Sentry.captureMessage(`LLM Execution Failed: ${data.provider}/${data.model}`, {
      level: "error",
      extra: data,
    });
  }

  if (data.success) {
    console.log(`[LLM_TELEMETRY][${timestamp}]`, JSON.stringify(data));
  } else {
    console.warn(`[LLM_FAILURE][${timestamp}]`, JSON.stringify(data));
  }
}

/**
 * Logs security and authentication events (lockouts, brute-force attempts, signups).
 */
export function logSecurityEvent(
  type: "login_lockout" | "login_failed" | "unauthorized_admin" | "rate_limit_exceeded" | "signup",
  details: Record<string, any>
): void {
  const timestamp = new Date().toISOString();

  if (isSentryConfigured && type !== "signup") {
    Sentry.captureMessage(`Security Event: ${type}`, {
      level: type === "login_lockout" || type === "unauthorized_admin" ? "warning" : "info",
      extra: details,
    });
  }

  console.warn(`[SECURITY_EVENT][${type}][${timestamp}]`, JSON.stringify(details));
}

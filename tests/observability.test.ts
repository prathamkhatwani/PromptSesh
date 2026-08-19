import { describe, it, expect, vi } from "vitest";
import { captureError, logLLMTelemetry, logSecurityEvent } from "@/lib/observability";

describe("Observability & Telemetry Suite", () => {
  it("should capture errors with structured context without throwing", () => {
    const error = new Error("Simulated LLM pipeline timeout");
    expect(() => {
      captureError(error, {
        tags: { model: "gemini-2.0-flash", challengeId: "chal-101" },
        extra: { attempt: 3 },
      });
    }).not.toThrow();
  });

  it("should log LLM telemetry metrics without throwing", () => {
    expect(() => {
      logLLMTelemetry({
        provider: "Google",
        model: "gemini-2.0-flash",
        latencyMs: 184,
        tokenCount: 420,
        success: true,
      });
    }).not.toThrow();
  });

  it("should capture security events (lockouts, brute force) safely", () => {
    expect(() => {
      logSecurityEvent("login_lockout", {
        email: "attacker@domain.com",
        attempts: 5,
        ip: "203.0.113.1",
      });
    }).not.toThrow();
  });
});

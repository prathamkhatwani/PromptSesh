"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const startRedirect = useCallback(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/auth/signin");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (success) {
      return startRedirect();
    }
  }, [success, startRedirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.message ?? "Failed to reset password. The link may have expired."
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 hero-glow">
        <div className="w-full max-w-md text-center">
          <div className="rounded-lg border border-white/[0.08] bg-[#192134] p-6 sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="mb-2 font-sans text-lg font-semibold text-white">
              Invalid Reset Link
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              This password reset link is missing a token. Please request a new
              one.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition-colors duration-150 hover:text-emerald-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 hero-glow">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <Terminal className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="font-sans text-2xl font-bold text-white">
            Set new password
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Choose a strong password for your account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-white/[0.08] bg-[#192134] p-6 sm:p-8">
          {success ? (
            /* Success State */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="mb-2 font-sans text-lg font-semibold text-white">
                Password reset successful
              </h2>
              <p className="mb-4 text-sm text-slate-400">
                Your password has been updated. Redirecting to sign in in{" "}
                <span className="font-mono font-semibold text-emerald-400">
                  {countdown}s
                </span>
                …
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition-colors duration-150 hover:text-emerald-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Sign in now
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-500"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-md border border-white/[0.08] bg-[#0F172A] py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 transition-colors duration-150 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-500"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-md border border-white/[0.08] bg-[#0F172A] py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 transition-colors duration-150 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-md bg-emerald-500 py-2.5 text-sm font-bold text-slate-900 transition-colors duration-150 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Resetting…" : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition-colors duration-150 hover:text-emerald-300"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

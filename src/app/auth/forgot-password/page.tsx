"use client";

import { useState } from "react";
import Link from "next/link";
import { Command, Loader2, Info, CheckCircle2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devPreviewUrl, setDevPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your account email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setDevPreviewUrl(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request.");
      }

      setSuccess(data.message || "Password reset verification link has been dispatched.");
      if (data.devPreviewUrl) {
        setDevPreviewUrl(data.devPreviewUrl);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#09090b]">
      <div className="relative w-full max-w-md space-y-5 rounded-lg border border-white/[0.08] bg-[#121215] p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center pb-4 border-b border-white/[0.06]">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#18181c] border border-white/[0.12] text-zinc-100">
              <Command className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              Prompt<span className="text-indigo-400">Sesh</span>
            </span>
          </Link>
          <h2 className="text-lg font-semibold text-white">
            Reset your password
          </h2>
          <p className="text-xs text-zinc-400">
            Enter your account email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-md">
            <Info className="h-3.5 w-3.5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-md">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{success}</span>
            </div>

            {devPreviewUrl && (
              <div className="p-3.5 bg-[#18181c] border border-white/[0.08] rounded-md text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-medium text-zinc-200 text-xs">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Dev Test Mailbox:</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Local sandbox active. Captured dispatch available in simulation mailbox:
                </p>
                <a
                  href={devPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline text-xs break-all block"
                >
                  Open Email in Test Inbox &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full rounded-md border border-white/[0.08] bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#f4f4f5] hover:bg-white text-[#09090b] px-4 py-2.5 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Send Password Reset Link"
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-zinc-500 pt-3 border-t border-white/[0.06]">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

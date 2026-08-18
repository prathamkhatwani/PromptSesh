"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Loader2, Info, CheckCircle2, ArrowLeft, Mail } from "lucide-react";

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

      setSuccess(data.message || "Password reset instructions have been generated.");
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
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-dark-950">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md space-y-6 glass-card p-8 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">Prompt</span>
              <span className="text-white">Sesh</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">
            Forgot Password
          </h2>
          <p className="text-xs text-slate-400">
            Enter your account email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
            <Info className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{success}</span>
            </div>

            {devPreviewUrl && (
              <div className="p-3.5 bg-dark-900/90 border border-cyan-500/30 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-cyan-400 text-xs">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Dev Test Mailbox:</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Real email delivery active! In local development without external SMTP configured, your email is captured by the test inbox:
                </p>
                <a
                  href={devPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold underline text-xs break-all"
                >
                  Open Email in Web Inbox &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/[0.08] bg-dark-900/60 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-white transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                "Send Password Reset Link"
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/[0.06]">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

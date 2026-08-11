"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Terminal, Loader2, Info, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Reset Password
        </h2>
        <p className="text-xs text-slate-400">
          Set a new password for your PromptSesh account
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
          <Info className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="text-center p-6 space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Password Successfully Reset!</h3>
          <p className="text-xs text-slate-300">
            Redirecting to sign in page...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-white/[0.08] bg-dark-900/60 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
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
              "Save New Password"
            )}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/[0.06]">
        <Link
          href="/auth/signin"
          className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-dark-950">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />

      <Suspense fallback={<div className="text-slate-400 text-xs">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Command, Loader2, Info, CheckCircle2 } from "lucide-react";

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

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
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
          Reset password
        </h2>
        <p className="text-xs text-zinc-400">
          Configure new credentials for your account
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-md">
          <Info className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="text-center p-6 space-y-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
          <CheckCircle2 className="h-7 w-7 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Password reset successful</h3>
          <p className="text-xs text-zinc-400">
            Redirecting to sign-in page in 2 seconds...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              New Password (Min 8 Characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-md border border-white/[0.08] bg-[#09090b] px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
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
              "Save New Password"
            )}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-zinc-500 pt-3 border-t border-white/[0.06]">
        <Link
          href="/auth/signin"
          className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#09090b]">
      <Suspense fallback={<div className="text-zinc-500 text-xs font-mono">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

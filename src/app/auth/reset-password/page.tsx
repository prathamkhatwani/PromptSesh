"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Info, CheckCircle2 } from "lucide-react";

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
    <div className="relative w-full max-w-md space-y-5 border border-[#27272a] bg-[#0a0a0a] p-6 sm:p-8 font-mono text-white">
      {/* Header */}
      <div className="text-center pb-4 border-b border-[#27272a]">
        <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
          <div className="flex h-6 w-6 items-center justify-center bg-white text-black font-black text-xs">
            ■
          </div>
          <span className="text-sm font-black tracking-tight text-white uppercase">
            PROMPTSESH
          </span>
        </Link>
        <h2 className="text-lg font-black text-white uppercase">
          CONFIGURE NEW PASSWORD
        </h2>
        <p className="text-xs text-zinc-400 font-sans mt-0.5">
          Commit updated credentials to your practitioner account
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 p-3">
          <Info className="h-4 w-4 shrink-0 text-[#ef4444]" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="text-center p-6 space-y-2 bg-black border border-white">
          <CheckCircle2 className="h-7 w-7 text-white mx-auto" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">CREDENTIALS COMMITTED SUCCESSFULLY</h3>
          <p className="text-xs text-zinc-400 font-sans">
            Redirecting to sign-in page in 2 seconds...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
              NEW_PASSWORD (MIN 8 CHARACTERS)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full border border-[#27272a] bg-black px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
              CONFIRM_NEW_PASSWORD
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full border border-[#27272a] bg-black px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black border border-white px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              "COMMIT UPDATE &rarr;"
            )}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-zinc-400 pt-3 border-t border-[#27272a]">
        <Link
          href="/auth/signin"
          className="font-bold text-white hover:underline uppercase"
        >
          [RETURN_TO_SIGN_IN]
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#000000] grid-bg font-mono">
      <Suspense fallback={<div className="text-zinc-500 text-xs font-mono">// INITIALIZING_SESSION...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

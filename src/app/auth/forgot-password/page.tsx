"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Info, CheckCircle2, ArrowLeft, Mail } from "lucide-react";

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
    <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#000000] font-mono text-white">
      <div className="relative w-full max-w-md space-y-5 border border-[#27272a] bg-[#0a0a0a] p-6 sm:p-8">
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
            RECOVER CREDENTIALS
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Dispatch verification token to your registered account
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 p-3">
            <Info className="h-4 w-4 shrink-0 text-[#ef4444]" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-white bg-black border border-white p-3.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-white mt-0.5" />
              <span>{success}</span>
            </div>

            {devPreviewUrl && (
              <div className="p-3.5 bg-black border border-[#27272a] text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-white text-xs uppercase">
                  <Mail className="h-3.5 w-3.5 text-white" />
                  <span>DEV_INBOX_INTERCEPT:</span>
                </div>
                <p className="text-zinc-400 text-[11px] font-sans">
                  Local sandbox active. Captured dispatch available in simulation mailbox:
                </p>
                <a
                  href={devPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline font-bold text-xs break-all block uppercase"
                >
                  [OPEN_TEST_MAILBOX] &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                ACCOUNT_EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="practitioner@research.org"
                className="w-full border border-[#27272a] bg-black px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black border border-white px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
              ) : (
                "DISPATCH TOKEN &rarr;"
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-zinc-400 pt-3 border-t border-[#27272a]">
          <Link
            href="/auth/signin"
            className="font-bold text-white hover:underline uppercase inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> [RETURN_TO_SIGN_IN]
          </Link>
        </div>
      </div>
    </div>
  );
}

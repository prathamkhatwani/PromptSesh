"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Info } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/challenges",
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/auth/signin?notice=Account+created+successfully!+Please+sign+in.");
      } else {
        router.push("/challenges");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#000000] grid-bg font-mono">
      <div className="relative w-full max-w-md space-y-5 border border-[#27272a] bg-[#0a0a0a] p-6 sm:p-8 text-white">
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
            REGISTER PRACTITIONER PROFILE
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Create an archival account to track lab completions
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 p-3">
            <Info className="h-4 w-4 shrink-0 text-[#ef4444]" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              PRACTITIONER_NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Claude Shannon"
              className="w-full border border-[#27272a] bg-black px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              EMAIL_ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="practitioner@research.org"
              className="w-full border border-[#27272a] bg-black px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              PASSWORD (MIN 8 CHARACTERS)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full border border-[#27272a] bg-black px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              CONFIRM_PASSWORD
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full border border-[#27272a] bg-black px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black border border-white px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 mt-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              "REGISTER ACCOUNT &rarr;"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-400 pt-3 border-t border-[#27272a]">
          ALREADY_REGISTERED?{" "}
          <Link
            href="/auth/signin"
            className="font-bold text-white hover:underline uppercase"
          >
            [SIGN_IN_HERE]
          </Link>
        </div>
      </div>
    </div>
  );
}

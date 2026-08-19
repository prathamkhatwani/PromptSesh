"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Command, Loader2, Info } from "lucide-react";

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
      setError("Passwords do not match. Please verify your password.");
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
            Create an account
          </h2>
          <p className="text-xs text-zinc-400">
            Track your prompt challenges and rubric performance
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-md">
            <Info className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className="w-full rounded-md border border-white/[0.08] bg-[#09090b] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@company.org"
              className="w-full rounded-md border border-white/[0.08] bg-[#09090b] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Password (Min 8 Characters)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-md border border-white/[0.08] bg-[#09090b] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-md border border-white/[0.08] bg-[#09090b] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#f4f4f5] hover:bg-white text-[#09090b] px-4 py-2.5 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-500 pt-3 border-t border-white/[0.06]">
          Already registered?{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-zinc-300 hover:text-white transition-colors underline underline-offset-4"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

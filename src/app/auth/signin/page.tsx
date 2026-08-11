"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Terminal, Sparkles, Loader2, Info } from "lucide-react";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/challenges";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const urlError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    urlError === "CredentialsSignin" || urlError === "Configuration"
      ? "Invalid email address or password. Please check your credentials or click 'Create Account' to sign up."
      : urlError
  );
  const [notice, setNotice] = useState<string | null>(null);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email address and password.");
      return;
    }

    setLoading("credentials");
    setError(null);
    setNotice(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email address or password. Please check your credentials or click 'Create Account' to sign up.");
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      setError("Invalid email address or password. Please check your credentials or click 'Create Account' to sign up.");
    } finally {
      setLoading(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading("github");
    setError(null);
    setNotice(null);
    try {
      const result = await signIn("github", { callbackUrl, redirect: false });
      const targetUrl = result?.url || "";
      const isDummyKey = targetUrl.includes("dummy-github-id") || targetUrl.includes("client_id=dummy");

      if (isDummyKey || result?.error) {
        setNotice("GitHub OAuth keys unconfigured in .env. Automatically logging in via Demo Account...");
        await signIn("demo", { callbackUrl });
      } else if (targetUrl) {
        window.location.href = targetUrl;
      } else {
        await signIn("demo", { callbackUrl });
      }
    } catch (error) {
      setNotice("Logging in via Demo Account...");
      await signIn("demo", { callbackUrl });
    } finally {
      setLoading(null);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading("demo");
    setError(null);
    setNotice(null);
    try {
      await signIn("demo", { callbackUrl });
    } catch (error) {
    } finally {
      setLoading(null);
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
          Welcome back
        </h2>
        <p className="text-xs text-slate-400">
          Sign in to your PromptSesh account or create a new one
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
          <Info className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
          <Info className="h-4 w-4 shrink-0 animate-pulse" />
          <span>{notice}</span>
        </div>
      )}

      {/* Native Password Auth Form */}
      <form onSubmit={handleCredentialsSignIn} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email Address
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/[0.08] bg-dark-900/60 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-white/20 bg-dark-900 text-cyan-500 focus:ring-0 accent-cyan-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span>Remember me on this device</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading !== null}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-white transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
        >
          {loading === "credentials" ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            "Sign In to PromptSesh"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.06]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          <span className="bg-dark-950 px-3">Or continue with</span>
        </div>
      </div>

      {/* Social & Fast Auth Buttons */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={loading !== null}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
        >
          {loading === "demo" ? (
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
          ) : (
            <Sparkles className="h-4 w-4 text-purple-400" />
          )}
          Quick Demo 1-Click Login
        </button>

        <button
          type="button"
          onClick={handleGitHubSignIn}
          disabled={loading !== null}
          className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-dark-900/50 hover:bg-dark-900 px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
        >
          {loading === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
          ) : (
            <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          )}
          GitHub OAuth
        </button>
      </div>

      {/* Link to Create Account */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/[0.06]">
        Don&apos;t have a PromptSesh account yet?{" "}
        <Link
          href="/auth/signup"
          className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-dark-950">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />

      <Suspense fallback={
        <div className="text-center text-slate-400">Loading sign in...</div>
      }>
        <SignInForm />
      </Suspense>
    </div>
  );
}

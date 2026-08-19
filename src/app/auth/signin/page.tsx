"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Info } from "lucide-react";

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
      ? "Invalid credentials or account throttled. Please check your details."
      : urlError
  );
  const [notice, setNotice] = useState<string | null>(null);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both account email and password.");
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
        setError("Invalid email or password. Please verify credentials or reset password.");
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      setError("Authentication error. Please try again later.");
    } finally {
      setLoading(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading("github");
    setError(null);
    setNotice(null);
    try {
      await signIn("github", { callbackUrl });
    } catch (error) {
      setError("GitHub OAuth connection failed. Please try again or use email signin.");
    } finally {
      setLoading(null);
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
          PRACTITIONER AUTHENTICATION
        </h2>
        <p className="text-xs text-zinc-400 font-sans mt-0.5">
          Sign in to access your challenges and submission records
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 p-3">
          <Info className="h-4 w-4 shrink-0 text-[#ef4444]" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 text-xs text-white bg-zinc-900 border border-white p-3">
          <Info className="h-4 w-4 shrink-0 text-white animate-pulse" />
          <span>{notice}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleCredentialsSignIn} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
            ACCOUNT_EMAIL
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="practitioner@institution.org"
            className="w-full border border-[#27272a] bg-black px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-zinc-300 uppercase">
              PASSWORD
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-zinc-400 hover:text-white underline font-bold"
            >
              [FORGOT_PWD?]
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full border border-[#27272a] bg-black px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-all"
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-white h-3.5 w-3.5 cursor-pointer"
            />
            <span>PERSIST_SESSION</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading !== null}
          className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black border border-white px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
        >
          {loading === "credentials" ? (
            <Loader2 className="h-4 w-4 animate-spin text-black" />
          ) : (
            "AUTHENTICATE &rarr;"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#27272a]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
          <span className="bg-[#0a0a0a] px-2">// OR_GITHUB</span>
        </div>
      </div>

      {/* GitHub Button */}
      <div>
        <button
          type="button"
          onClick={handleGitHubSignIn}
          disabled={loading !== null}
          className="w-full inline-flex items-center justify-center gap-2 border border-[#27272a] bg-black hover:bg-[#181818] hover:border-white px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50 uppercase"
        >
          {loading === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          )}
          CONTINUE_WITH_GITHUB
        </button>
      </div>

      {/* Footer link */}
      <div className="text-center text-xs text-zinc-400 pt-3 border-t border-[#27272a]">
        NO_ACCOUNT_REGISTERED?{" "}
        <Link
          href="/auth/signup"
          className="font-bold text-white hover:underline uppercase"
        >
          [REGISTER_NEW_USER]
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#000000] grid-bg">
      <Suspense fallback={
        <div className="text-center text-zinc-400 text-xs font-mono">// INITIALIZING_SESSION...</div>
      }>
        <SignInForm />
      </Suspense>
    </div>
  );
}

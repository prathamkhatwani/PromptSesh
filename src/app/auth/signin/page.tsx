"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Terminal } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md space-y-8 glass-card p-10 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">Prompt</span>
              <span className="text-white">Code</span>
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to resume your prompt engineering practice
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4 pt-4">
          <button
            onClick={() => signIn("github", { redirectTo: "/challenges" })}
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition-all shadow-md cursor-pointer hover:border-white/[0.12]"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-6 border-t border-white/[0.06]">
          By continuing, you agree to PromptSesh's{" "}
          <a href="#" className="hover:text-slate-300 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="hover:text-slate-300 underline">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Command, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#09090b] text-zinc-400 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[#18181c] border border-white/[0.12] text-zinc-100">
                <Command className="h-3 w-3" />
              </div>
              <span className="text-sm font-semibold text-zinc-100 tracking-tight">
                Prompt<span className="text-indigo-400">Sesh</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The developer workbench for deterministic prompt engineering and structured rubric evaluations.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <a
                href="https://github.com/prathamkhatwani/PromptSesh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "PRACTICE",
              links: [
                { href: "/challenges", label: "All Challenges" },
                { href: "/interview-simulator", label: "Mock Interviews" },
                { href: "/leaderboard", label: "Leaderboard" },
              ],
            },
            {
              title: "ACCOUNT",
              links: [
                { href: "/profile", label: "Developer Profile" },
                { href: "/auth/signin", label: "Sign In" },
                { href: "/auth/signup", label: "Create Account" },
              ],
            },
            {
              title: "FOUNDATION MODELS",
              links: [
                { href: "/challenges", label: "Meta Llama 3.3 70B" },
                { href: "/challenges", label: "Google Gemini 2.0 Flash" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-[11px] font-mono font-medium text-zinc-300 mb-3 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2 text-xs">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2 font-mono">
          <div>&copy; {new Date().getFullYear()} PromptSesh. All rights reserved.</div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>SYSTEM: NORMAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

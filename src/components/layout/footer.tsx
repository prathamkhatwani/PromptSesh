import Link from "next/link";
import { Terminal, ExternalLink } from "lucide-react";

const practiceLinks = [
  { href: "/challenges", label: "All Challenges" },
  { href: "/simulator", label: "Prompt Simulator" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/challenges?difficulty=easy", label: "Easy Challenges" },
  { href: "/challenges?difficulty=hard", label: "Hard Challenges" },
];

const accountLinks = [
  { href: "/profile", label: "Your Profile" },
  { href: "/profile/settings", label: "Settings" },
  { href: "/profile/submissions", label: "Submissions" },
  { href: "/auth/signin", label: "Sign In" },
  { href: "/auth/signup", label: "Create Account" },
];

const modelLinks = [
  { href: "https://openai.com", label: "OpenAI", external: true },
  { href: "https://anthropic.com", label: "Anthropic", external: true },
  { href: "https://deepmind.google", label: "Google DeepMind", external: true },
  { href: "https://meta.ai", label: "Meta AI", external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0B1120]">
      {/* ── Main Grid ── */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 cursor-pointer">
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-[#192134]">
                <Terminal className="h-4 w-4 text-emerald-400" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-white">Prompt</span>
                <span className="text-emerald-400">Sesh</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Sharpen your prompt engineering skills with real-world challenges, an
              interactive simulator, and community-driven leaderboards.
            </p>
            <a
              href="https://github.com/promptsesh"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-400 transition-colors duration-150 hover:text-emerald-400"
            >
              GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Practice Links */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Practice
            </h4>
            <ul className="mt-4 space-y-2.5">
              {practiceLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="cursor-pointer text-sm text-slate-400 transition-colors duration-150 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Account
            </h4>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="cursor-pointer text-sm text-slate-400 transition-colors duration-150 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Foundation Models */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Foundation Models
            </h4>
            <ul className="mt-4 space-y-2.5">
              {modelLinks.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-150 hover:text-white"
                  >
                    {label}
                    <ExternalLink className="h-3 w-3 text-slate-600" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/[0.05]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} PromptSesh. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              System // Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

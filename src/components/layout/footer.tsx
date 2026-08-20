import Link from "next/link";
import { Terminal, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-dark-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
                <Terminal className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-bold">
                <span className="gradient-text">Prompt</span>
                <span className="text-white">Sesh</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              The practice platform for prompt engineering. Level up your AI
              skills.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com/prathamkhatwani/PromptSesh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Practice",
              links: [
                { href: "/challenges", label: "All Challenges" },
                { href: "/interview-simulator", label: "Mock Interviews" },
                { href: "/leaderboard", label: "Leaderboard" },
              ],
            },
            {
              title: "Account",
              links: [
                { href: "/profile", label: "Your Profile" },
                { href: "/auth/signin", label: "Sign In" },
              ],
            },
            {
              title: "Project",
              links: [
                { href: "https://github.com/prathamkhatwani/PromptSesh", label: "GitHub" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] text-center text-xs text-slate-600">
          © {new Date().getFullYear()} PromptSesh. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

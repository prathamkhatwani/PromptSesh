import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#27272a] bg-[#000000] text-zinc-400 font-mono select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-5 w-5 items-center justify-center bg-white text-black font-black text-xs">
                ■
              </div>
              <span className="text-sm font-black text-white uppercase tracking-tight">
                PROMPTSESH
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans">
              Deterministic evaluation workbench for prompt engineering and multi-model rubric benchmarking.
            </p>
            <div className="mt-3">
              <a
                href="https://github.com/prathamkhatwani/PromptSesh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 font-bold"
              >
                <span>[GITHUB_REPOSITORY]</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "[CURRICULUM]",
              links: [
                { href: "/challenges", label: "01. CHALLENGES" },
                { href: "/interview-simulator", label: "02. SIMULATOR" },
                { href: "/leaderboard", label: "03. LEADERBOARD" },
              ],
            },
            {
              title: "[PRACTITIONER]",
              links: [
                { href: "/profile", label: "04. PROFILE" },
                { href: "/auth/signin", label: "05. SIGN IN" },
                { href: "/auth/signup", label: "06. REGISTER" },
              ],
            },
            {
              title: "[ENGINES]",
              links: [
                { href: "/challenges", label: "META LLAMA 3.3 70B" },
                { href: "/challenges", label: "GOOGLE GEMINI 2.0 FLASH" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-[11px] font-bold text-white mb-3 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2 text-xs">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      &gt; {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-2">
          <div>&copy; {new Date().getFullYear()} PROMPTSESH // SWISS MONOCHROME SPECIFICATION</div>
          <div className="flex items-center gap-1.5 text-zinc-400 font-bold">
            <span>SYSTEM: ONLINE [ZERO FAULTS]</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

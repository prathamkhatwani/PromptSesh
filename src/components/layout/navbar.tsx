"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, User, Terminal } from "lucide-react";

const navLinks = [
  { href: "/challenges", label: "Challenges" },
  { href: "/interview-simulator", label: "Simulator" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#0F172A]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Brand ── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-[#192134]">
            <Terminal className="h-4 w-4 text-emerald-400" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Prompt</span>
            <span className="text-emerald-400">Sesh</span>
          </span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive(href)
                    ? "bg-[#192134] text-emerald-400"
                    : "text-slate-400 hover:bg-[#192134] hover:text-white"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Auth Controls (desktop) ── */}
        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 animate-pulse rounded-full bg-[#192134]" />
              <div className="h-4 w-20 animate-pulse rounded bg-[#192134]" />
            </div>
          )}

          {status === "authenticated" && session?.user && (
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "Avatar"}
                  className="h-8 w-8 rounded-full border border-white/[0.08]"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-[#192134]">
                  <User className="h-4 w-4 text-slate-400" />
                </span>
              )}

              <span className="max-w-[120px] truncate text-sm font-medium text-white">
                {session.user.name}
              </span>

              <button
                onClick={() => signOut()}
                className="cursor-pointer flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#192134] px-3 py-1.5 text-sm text-slate-400 transition-colors duration-150 hover:border-white/[0.14] hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}

          {status === "unauthenticated" && (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="cursor-pointer text-sm font-medium text-slate-400 transition-colors duration-150 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="cursor-pointer rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-900 transition-colors duration-150 hover:bg-emerald-400"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-[#192134] text-slate-400 transition-colors duration-150 hover:border-white/[0.14] hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* ── Mobile Menu Panel ── */}
      {mobileOpen && (
        <div className="border-t border-white/[0.05] bg-[#0F172A] md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`cursor-pointer block rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive(href)
                    ? "bg-[#192134] text-emerald-400"
                    : "text-slate-400 hover:bg-[#192134] hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Mobile auth */}
            <div className="mt-4 border-t border-white/[0.05] pt-4">
              {status === "loading" && (
                <div className="flex items-center gap-2 px-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-[#192134]" />
                  <div className="h-4 w-24 animate-pulse rounded bg-[#192134]" />
                </div>
              )}

              {status === "authenticated" && session?.user && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 px-3">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name ?? "Avatar"}
                        className="h-8 w-8 rounded-full border border-white/[0.08]"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-[#192134]">
                        <User className="h-4 w-4 text-slate-400" />
                      </span>
                    )}
                    <span className="truncate text-sm font-medium text-white">
                      {session.user.name}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="cursor-pointer flex w-full items-center gap-2 rounded-md border border-white/[0.08] bg-[#192134] px-3 py-2.5 text-sm text-slate-400 transition-colors duration-150 hover:border-white/[0.14] hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}

              {status === "unauthenticated" && (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileOpen(false)}
                    className="cursor-pointer block rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors duration-150 hover:bg-[#192134] hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="cursor-pointer block rounded-md bg-emerald-500 px-3 py-2.5 text-center text-sm font-bold text-slate-900 transition-colors duration-150 hover:bg-emerald-400"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

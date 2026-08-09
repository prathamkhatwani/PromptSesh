"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Terminal, Menu, X, ChevronRight, LogOut, User } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const loading = status === "loading";
  const user = session?.user;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-dark-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20 transition-shadow group-hover:shadow-cyan-500/40">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="gradient-text">Prompt</span>
              <span className="text-white">Sesh</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "/challenges", label: "Challenges" },
              { href: "/leaderboard", label: "Leaderboard" },
              { href: "/profile", label: "Profile" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-400 rounded-lg transition-all hover:text-white hover:bg-white/[0.04]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-20 bg-white/5 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-7 w-7 rounded-full border border-white/10"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-all hover:text-white hover:bg-white/[0.04]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin"
                  className="group relative inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110"
                >
                  Get Started
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] py-4 space-y-1">
            {[
              { href: "/challenges", label: "Challenges" },
              { href: "/categories", label: "Categories" },
              { href: "/leaderboard", label: "Leaderboard" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-sm font-medium text-slate-400 rounded-lg transition-all hover:text-white hover:bg-white/[0.04]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/[0.06] space-y-2 px-4">
              {loading ? (
                <div className="h-10 w-full bg-white/5 animate-pulse rounded-lg" />
              ) : user ? (
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04] mb-2">
                  <div className="flex items-center gap-2.5">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-8 w-8 rounded-full border border-white/10"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                        <User className="h-4 w-4 text-cyan-400" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-200">
                      {user.name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-2 text-slate-400 hover:text-white rounded-lg"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block text-center py-2.5 text-sm font-medium text-slate-300 rounded-lg border border-white/[0.08] hover:bg-white/[0.04]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="block text-center py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

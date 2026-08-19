"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, User, Command } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const loading = status === "loading";
  const user = session?.user;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-xl select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#18181c] border border-white/[0.12] text-zinc-100 shadow-xs group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors">
              <Command className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                Prompt<span className="text-indigo-400">Sesh</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "/challenges", label: "Challenges" },
              { href: "/interview-simulator", label: "Simulator" },
              { href: "/leaderboard", label: "Leaderboard" },
              { href: "/profile", label: "Profile" },
            ].map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    isActive
                      ? "text-zinc-100 bg-[#18181c] border border-white/[0.12] shadow-xs"
                      : "text-zinc-400 border border-transparent hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {loading ? (
              <div className="h-7 w-20 bg-zinc-800 animate-pulse rounded-md" />
            ) : user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors border border-white/[0.08] rounded-md px-2.5 py-1 bg-[#121215] hover:bg-[#18181c]"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-4 w-4 rounded-full border border-white/20"
                    />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                      <User className="h-2.5 w-2.5 text-indigo-400" />
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[110px] truncate">
                    {user.name || user.email}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 border border-white/[0.08] hover:border-white/[0.16] hover:bg-[#18181c] rounded-md transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors rounded-md hover:bg-white/[0.04]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-1 rounded-md bg-[#f4f4f5] hover:bg-white text-[#09090b] border border-white/20 px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-200 border border-white/[0.08] rounded-md transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] py-3 space-y-1 bg-[#121215]">
            {[
              { href: "/challenges", label: "Challenges" },
              { href: "/interview-simulator", label: "Simulator" },
              { href: "/leaderboard", label: "Leaderboard" },
              { href: "/profile", label: "Profile" },
            ].map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 text-xs font-medium rounded-md ${
                    isActive
                      ? "text-white bg-[#18181c] border border-white/[0.12]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/[0.08] space-y-2 px-3">
              {loading ? (
                <div className="h-8 w-full bg-zinc-800 animate-pulse rounded-md" />
              ) : user ? (
                <div className="flex items-center justify-between py-2 border-b border-white/[0.08]">
                  <span className="text-xs font-medium text-zinc-200 truncate">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/auth/signin"
                    className="text-center py-2 text-xs font-medium text-zinc-300 border border-white/[0.08] rounded-md hover:bg-[#18181c]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-center py-2 text-xs font-semibold text-[#09090b] bg-[#f4f4f5] hover:bg-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, User } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const loading = status === "loading";
  const user = session?.user;

  return (
    <nav className="sticky top-0 z-50 border-b border-[#27272a] bg-[#000000] select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-6 w-6 items-center justify-center bg-white text-black font-black text-xs">
              ■
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-sm font-black tracking-tight text-white uppercase">
                PROMPTSESH
              </span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">
                // SYSTEM_01
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 font-mono">
            {[
              { href: "/challenges", label: "[01] CHALLENGES" },
              { href: "/interview-simulator", label: "[02] INTERVIEWS" },
              { href: "/leaderboard", label: "[03] LEADERBOARD" },
              { href: "/profile", label: "[04] PROFILE" },
            ].map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1 text-xs font-bold transition-all border ${
                    isActive
                      ? "text-black bg-white border-white"
                      : "text-zinc-400 border-transparent hover:text-white hover:border-[#3f3f46]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Controls */}
          <div className="hidden md:flex items-center gap-2 font-mono">
            {loading ? (
              <div className="h-7 w-20 bg-zinc-900 border border-zinc-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-xs font-bold text-zinc-200 hover:text-white transition-colors border border-zinc-800 px-2.5 py-1 bg-black hover:border-white"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-4 w-4 border border-zinc-700"
                    />
                  ) : (
                    <div className="h-4 w-4 bg-white text-black font-bold flex items-center justify-center text-[10px]">
                      {user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[110px] truncate text-[11px]">
                    {user.name || user.email}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-1 text-zinc-400 hover:text-white border border-zinc-800 hover:border-white transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-3 py-1 text-xs font-bold text-zinc-300 hover:text-white border border-zinc-800 hover:border-white transition-colors"
                >
                  [LOGIN]
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-1 bg-white hover:bg-zinc-200 text-black border border-white px-3.5 py-1 text-xs font-black uppercase transition-all"
                >
                  START &rarr;
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-1 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 py-3 space-y-1 bg-black font-mono">
            {[
              { href: "/challenges", label: "[01] CHALLENGES" },
              { href: "/interview-simulator", label: "[02] INTERVIEWS" },
              { href: "/leaderboard", label: "[03] LEADERBOARD" },
              { href: "/profile", label: "[04] PROFILE" },
            ].map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 text-xs font-bold border ${
                    isActive
                      ? "text-black bg-white border-white"
                      : "text-zinc-400 border-transparent hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-zinc-800 space-y-2 px-3">
              {loading ? (
                <div className="h-8 w-full bg-zinc-900 border border-zinc-800 animate-pulse" />
              ) : user ? (
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white truncate">
                    USER: {user.name || user.email}
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
                    className="text-center py-2 text-xs font-bold text-white border border-zinc-800 hover:border-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    [LOGIN]
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-center py-2 text-xs font-black text-black bg-white hover:bg-zinc-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    START &rarr;
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

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, Terminal } from "lucide-react";
import { getDifficultyBg, formatNumber } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  challengeCount: number;
}

interface Challenge {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  categorySlug: string;
  acceptanceRate: number;
  totalSubmissions: number;
  isCompleted?: boolean;
  isPremium?: boolean;
}

interface ChallengeListProps {
  initialChallenges: Challenge[];
  initialCategories: Category[];
  initialCategoryFilter?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIFFICULTY_TABS = ["All", "Easy", "Medium", "Hard", "Expert"] as const;

type SortKey =
  | "title"
  | "difficulty"
  | "category"
  | "acceptanceRate"
  | "totalSubmissions";

const DIFFICULTY_ORDER: Record<string, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
  Expert: 3,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDifficultyText(difficulty: string): string {
  switch (difficulty) {
    case "Easy":
      return "text-emerald-400";
    case "Medium":
      return "text-amber-400";
    case "Hard":
      return "text-red-400";
    case "Expert":
      return "text-purple-400";
    default:
      return "text-slate-400";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChallengeList({
  initialChallenges,
  initialCategories,
  initialCategoryFilter = "",
}: ChallengeListProps) {
  // -- state ----------------------------------------------------------------
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("All");
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategoryFilter
  );
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortAsc, setSortAsc] = useState(true);

  // -- derived data ---------------------------------------------------------
  const filtered = useMemo(() => {
    let list = initialChallenges;

    // search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // difficulty
    if (difficulty !== "All") {
      list = list.filter((c) => c.difficulty === difficulty);
    }

    // category
    if (activeCategory) {
      list = list.filter((c) => c.categorySlug === activeCategory);
    }

    // sort
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "difficulty":
          cmp =
            (DIFFICULTY_ORDER[a.difficulty] ?? 99) -
            (DIFFICULTY_ORDER[b.difficulty] ?? 99);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "acceptanceRate":
          cmp = a.acceptanceRate - b.acceptanceRate;
          break;
        case "totalSubmissions":
          cmp = a.totalSubmissions - b.totalSubmissions;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [initialChallenges, search, difficulty, activeCategory, sortKey, sortAsc]);

  const hasActiveFilters =
    search.trim() !== "" || difficulty !== "All" || activeCategory !== "";

  // -- handlers -------------------------------------------------------------
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function resetFilters() {
    setSearch("");
    setDifficulty("All");
    setActiveCategory("");
    setSortKey("title");
    setSortAsc(true);
  }

  // -- render ---------------------------------------------------------------
  return (
    <section className="w-full space-y-6">
      {/* ── Search ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search challenges…"
          className="w-full bg-[#0F172A] border border-white/[0.08] rounded-md py-2.5 pl-10 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors duration-200"
        />
      </div>

      {/* ── Difficulty tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {DIFFICULTY_TABS.map((tab) => {
          const isActive = difficulty === tab;
          return (
            <button
              key={tab}
              onClick={() => setDifficulty(tab)}
              className={`cursor-pointer shrink-0 px-4 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-colors duration-150 ${
                isActive
                  ? tab === "All"
                    ? "bg-emerald-500 text-slate-900 font-bold"
                    : tab === "Easy"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : tab === "Medium"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : tab === "Hard"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                  : "bg-[#192134] border border-white/[0.08] text-slate-400 hover:border-white/[0.14] hover:text-white"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Category strip ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory("")}
          className={`cursor-pointer shrink-0 px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors duration-150 ${
            activeCategory === ""
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-[#192134] border border-white/[0.08] text-slate-400 hover:border-white/[0.14] hover:text-white"
          }`}
        >
          All Topics
        </button>
        {initialCategories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`cursor-pointer shrink-0 px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors duration-150 ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-[#192134] border border-white/[0.08] text-slate-400 hover:border-white/[0.14] hover:text-white"
              }`}
            >
              {cat.name}
              <span className="ml-1.5 text-slate-500">{cat.challengeCount}</span>
            </button>
          );
        })}
      </div>

      {/* ── Results summary ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-400">
          Showing{" "}
          <span className="text-white font-medium">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "challenge" : "challenges"}
        </p>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="cursor-pointer text-emerald-400 hover:text-emerald-300 text-xs font-mono uppercase tracking-wider transition-colors duration-150"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <Terminal className="h-10 w-10 text-slate-500" />
          <p className="text-slate-400 text-sm">
            No challenges match your filters.
          </p>
          <button
            onClick={resetFilters}
            className="cursor-pointer text-emerald-400 hover:text-emerald-300 text-xs font-mono uppercase tracking-wider transition-colors duration-150"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Desktop table ──────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 pr-2 text-left w-14">Status</th>
                <th className="py-3 px-2 text-left">
                  <button
                    onClick={() => handleSort("title")}
                    className="cursor-pointer inline-flex items-center gap-1 hover:text-white transition-colors duration-150"
                  >
                    Challenge Title
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-2 text-left w-24">
                  <button
                    onClick={() => handleSort("difficulty")}
                    className="cursor-pointer inline-flex items-center gap-1 hover:text-white transition-colors duration-150"
                  >
                    Tier
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-2 text-left w-36">
                  <button
                    onClick={() => handleSort("category")}
                    className="cursor-pointer inline-flex items-center gap-1 hover:text-white transition-colors duration-150"
                  >
                    Category
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-2 text-right w-28">
                  <button
                    onClick={() => handleSort("acceptanceRate")}
                    className="cursor-pointer inline-flex items-center gap-1 ml-auto hover:text-white transition-colors duration-150"
                  >
                    Pass Rate
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 pl-2 text-right w-24">
                  <button
                    onClick={() => handleSort("totalSubmissions")}
                    className="cursor-pointer inline-flex items-center gap-1 ml-auto hover:text-white transition-colors duration-150"
                  >
                    Runs
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-white/[0.05] hover:bg-[#243044] transition-colors duration-150 group"
                >
                  {/* Status */}
                  <td className="py-3 pr-2">
                    <span
                      className={`font-mono text-xs ${
                        c.isCompleted ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {c.isCompleted ? "[OK]" : "[--]"}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="py-3 px-2">
                    <Link
                      href={`/challenges/${c.slug}`}
                      className="text-white hover:text-emerald-400 transition-colors duration-150 font-medium"
                    >
                      {c.title}
                    </Link>
                    {c.isPremium && (
                      <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        Pro
                      </span>
                    )}
                  </td>

                  {/* Difficulty */}
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${getDifficultyBg(
                        c.difficulty
                      )} ${getDifficultyText(c.difficulty)}`}
                    >
                      {c.difficulty}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-2 text-slate-400 text-xs">
                    {c.category}
                  </td>

                  {/* Acceptance Rate */}
                  <td className="py-3 px-2 text-right font-mono text-slate-400 text-xs">
                    {c.acceptanceRate.toFixed(1)}%
                  </td>

                  {/* Total Submissions */}
                  <td className="py-3 pl-2 text-right font-mono text-slate-400 text-xs">
                    {formatNumber(c.totalSubmissions)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile card view ───────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="md:hidden space-y-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/challenges/${c.slug}`}
              className="block bg-[#192134] border border-white/[0.08] rounded-lg p-4 hover:bg-[#243044] hover:border-white/[0.14] transition-colors duration-150 cursor-pointer"
            >
              {/* Top row: status + difficulty */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`font-mono text-xs ${
                    c.isCompleted ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {c.isCompleted ? "[OK]" : "[--]"}
                </span>
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${getDifficultyBg(
                    c.difficulty
                  )} ${getDifficultyText(c.difficulty)}`}
                >
                  {c.difficulty}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-white font-medium text-sm mb-1">
                {c.title}
                {c.isPremium && (
                  <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                    Pro
                  </span>
                )}
              </h3>

              {/* Category */}
              <p className="text-slate-500 text-xs mb-3">{c.category}</p>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>
                  Pass{" "}
                  <span className="text-white">
                    {c.acceptanceRate.toFixed(1)}%
                  </span>
                </span>
                <span>
                  Runs{" "}
                  <span className="text-white">
                    {formatNumber(c.totalSubmissions)}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

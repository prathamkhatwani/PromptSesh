"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Lock,
  ArrowUpDown,
} from "lucide-react";
import { getDifficultyBg, formatNumber } from "@/lib/utils";

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
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
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

const difficulties = ["All", "EASY", "MEDIUM", "HARD", "EXPERT"] as const;

type SortField = "title" | "difficulty" | "acceptanceRate" | "totalSubmissions";
type SortDirection = "asc" | "desc";

export function ChallengeList({
  initialChallenges,
  initialCategories,
  initialCategoryFilter,
}: ChallengeListProps) {
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  
  // Find matching category name from slug if passed
  const matchingCat = initialCategoryFilter
    ? initialCategories.find((c) => c.slug === initialCategoryFilter || c.name.toLowerCase() === initialCategoryFilter.toLowerCase())
    : null;
    
  const [selectedCategory, setSelectedCategory] = useState<string>(
    matchingCat ? matchingCat.slug : "All"
  );
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredChallenges = useMemo(() => {
    let filtered = [...initialChallenges];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    if (selectedDifficulty !== "All") {
      const difficultyMapping: Record<string, string> = {
        EASY: "Easy",
        MEDIUM: "Medium",
        HARD: "Hard",
        EXPERT: "Expert",
      };
      const targetDiff = difficultyMapping[selectedDifficulty] || selectedDifficulty;
      filtered = filtered.filter((c) => c.difficulty === targetDiff);
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((c) => c.categorySlug === selectedCategory);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "difficulty": {
          const order: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2, Expert: 3 };
          comparison = (order[a.difficulty] ?? 0) - (order[b.difficulty] ?? 0);
          break;
        }
        case "acceptanceRate":
          comparison = a.acceptanceRate - b.acceptanceRate;
          break;
        case "totalSubmissions":
          comparison = a.totalSubmissions - b.totalSubmissions;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [initialChallenges, search, selectedDifficulty, selectedCategory, sortField, sortDirection]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
              <span>⚡</span>
              <span>100 Interactive Prompt Engineering Labs</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Explore Challenges
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Solve real-world prompt engineering scenarios, test across multiple LLMs, and receive instant criteria-level rubric scores from automated AI judges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-dark-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-center shrink-0">
              <div className="text-xl font-extrabold text-cyan-400 font-mono">{initialChallenges.length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Labs</div>
            </div>
            <div className="bg-dark-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-center shrink-0">
              <div className="text-xl font-extrabold text-purple-400 font-mono">{initialCategories.length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Categories</div>
            </div>
            <div className="bg-dark-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-center shrink-0">
              <div className="text-xl font-extrabold text-emerald-400 font-mono">4</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tiers</div>
            </div>
          </div>
        </div>

        {/* Filters & Categories Toolbar */}
        <div className="glass-card p-5 mb-8 space-y-4">
          {/* Top Control Bar: Search & Difficulty */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by keyword, domain, or tag (e.g. 'Fintech', 'JSON', 'Security')..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-dark-900/80 py-2.5 pl-10 pr-10 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:bg-dark-900 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Difficulty Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
                Difficulty:
              </span>
              {difficulties.map((diff) => {
                const isActive = selectedDifficulty === diff;
                const colorClasses =
                  diff === "All"
                    ? isActive
                      ? "bg-white/10 text-white border-white/20 shadow-sm"
                      : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.03]"
                    : isActive
                    ? getDifficultyBg(diff) + " border shadow-sm"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.03]";
                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${colorClasses}`}
                  >
                    {diff === "All" ? "All Tiers" : diff.charAt(0) + diff.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Tabs Strip (No Scrollbar, Sleek Design) */}
          <div className="pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
                  selectedCategory === "All"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-md shadow-cyan-500/20"
                    : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.05]"
                }`}
              >
                <span>All Categories</span>
                <span className="text-[10px] opacity-75 bg-black/20 px-1.5 py-0.5 rounded-full font-mono">
                  {initialChallenges.length}
                </span>
              </button>

              {initialCategories.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                const count = initialChallenges.filter(c => c.categorySlug === cat.slug).length;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-md shadow-cyan-500/20"
                        : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.05]"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {count > 0 && (
                      <span className="text-[10px] opacity-75 bg-black/20 px-1.5 py-0.5 rounded-full font-mono">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary Bar & Active Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-white/[0.04]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono">
                Showing <strong className="text-white">{filteredChallenges.length}</strong> of {initialChallenges.length} challenges
              </span>
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-md px-2 py-0.5 text-[11px]">
                  Category: {initialCategories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory("All")} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {selectedDifficulty !== "All" && (
                <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-md px-2 py-0.5 text-[11px]">
                  Difficulty: {selectedDifficulty}
                  <button onClick={() => setSelectedDifficulty("All")} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
            </div>

            {(search || selectedDifficulty !== "All" || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedDifficulty("All");
                  setSelectedCategory("All");
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-xs underline underline-offset-4"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Challenges Table */}
        <div className="glass-card overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[44px_1fr_120px_200px_120px_120px] items-center gap-4 px-6 py-3 border-b border-white/[0.06] text-xs font-medium text-slate-500 uppercase tracking-wider">
            <div>Status</div>
            <button
              onClick={() => handleSort("title")}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors text-left"
            >
              Title
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleSort("difficulty")}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors"
            >
              Difficulty
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <div>Category</div>
            <button
              onClick={() => handleSort("acceptanceRate")}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors"
            >
              Acceptance
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleSort("totalSubmissions")}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors"
            >
              Submissions
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>

          {/* Table Rows */}
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              No challenges found matching your filters.
            </div>
          ) : (
            filteredChallenges.map((challenge, idx) => (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.slug}`}
                className={`group grid grid-cols-1 sm:grid-cols-[44px_1fr_120px_200px_120px_120px] items-center gap-4 px-6 py-4 border-b border-white/[0.04] transition-all duration-200 hover:bg-white/[0.04] hover:border-cyan-500/30 ${
                  idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                }`}
              >
                {/* Status */}
                <div className="hidden sm:block">
                  {challenge.isCompleted ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                  ) : challenge.isPremium ? (
                    <Lock className="h-4 w-4 text-amber-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/[0.1]" />
                  )}
                </div>

                {/* Title */}
                <div>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                    {challenge.title}
                  </span>
                </div>

                {/* Difficulty */}
                <div>
                  <span
                    className={`inline-flex rounded-md border px-2.5 py-0.5 text-xs font-medium ${getDifficultyBg(
                      challenge.difficulty
                    )}`}
                  >
                    {challenge.difficulty}
                  </span>
                </div>

                {/* Category */}
                <div>
                  <span className="text-xs text-slate-400 bg-white/[0.04] rounded-md px-2 py-1">
                    {challenge.category}
                  </span>
                </div>

                {/* Acceptance Rate */}
                <div className="text-sm text-slate-400">
                  {challenge.totalSubmissions > 0 ? `${challenge.acceptanceRate}%` : "New"}
                </div>

                {/* Submissions */}
                <div className="text-sm text-slate-400 font-mono">
                  {challenge.totalSubmissions > 0 ? formatNumber(challenge.totalSubmissions) : "0"}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

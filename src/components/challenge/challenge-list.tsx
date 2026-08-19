"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  Command,
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#141417] px-2.5 py-1 text-xs font-medium text-zinc-300 mb-2">
              <Command className="h-3 w-3 text-indigo-400" />
              <span>Challenge Index // {initialChallenges.length} Interactive Labs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Explore Challenges
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mt-1">
              Deterministic engineering specifications tested across free foundation models with criteria-level rubric scorecards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-md border border-white/[0.08] bg-[#121215] px-3 py-1.5 text-center shadow-xs">
              <div className="text-sm font-semibold text-zinc-100">{initialChallenges.length}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">LABS</div>
            </div>
            <div className="rounded-md border border-white/[0.08] bg-[#121215] px-3 py-1.5 text-center shadow-xs">
              <div className="text-sm font-semibold text-indigo-400">{initialCategories.length}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">TRACKS</div>
            </div>
            <div className="rounded-md border border-white/[0.08] bg-[#121215] px-3 py-1.5 text-center shadow-xs">
              <div className="text-sm font-semibold text-zinc-300">2</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">MODELS</div>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="rounded-lg border border-white/[0.08] bg-[#121215] p-4 mb-6 space-y-3 shadow-sm">
          {/* Search & Difficulty */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search challenges by keyword, token, or technique (e.g. 'JSON', 'Security')..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-[#09090b] py-2 pl-9 pr-8 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.2] focus:outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Difficulty Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {difficulties.map((diff) => {
                const isActive = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "border-white/[0.2] bg-[#18181c] text-white shadow-xs"
                        : "border-white/[0.06] bg-[#09090b] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]"
                    }`}
                  >
                    {diff === "All" ? "All Levels" : diff.charAt(0) + diff.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories Strip */}
          <div className="pt-2.5 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 transition-all border cursor-pointer ${
                  selectedCategory === "All"
                    ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300 font-semibold"
                    : "border-white/[0.06] bg-[#09090b] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]"
                }`}
              >
                All Tracks ({initialChallenges.length})
              </button>

              {initialCategories.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                const count = initialChallenges.filter(c => c.categorySlug === cat.slug).length;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 transition-all border cursor-pointer ${
                      isActive
                        ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300 font-semibold"
                        : "border-white/[0.06] bg-[#09090b] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]"
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/[0.06]">
            <span>
              Showing <strong className="text-zinc-200">{filteredChallenges.length}</strong> matching challenges
            </span>

            {(search || selectedDifficulty !== "All" || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedDifficulty("All");
                  setSelectedCategory("All");
                }}
                className="text-indigo-400 hover:text-indigo-300 transition-colors underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Challenges Table */}
        <div className="rounded-lg border border-white/[0.08] bg-[#121215] overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[50px_1fr_120px_180px_120px_120px] items-center gap-3 px-5 py-3 border-b border-white/[0.08] text-xs font-medium text-zinc-400 uppercase tracking-wider bg-[#0e0e11]">
            <div>Status</div>
            <button
              onClick={() => handleSort("title")}
              className="flex items-center gap-1 hover:text-zinc-200 text-left cursor-pointer"
            >
              Challenge Title
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleSort("difficulty")}
              className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer"
            >
              Tier
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <div>Category</div>
            <button
              onClick={() => handleSort("acceptanceRate")}
              className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer"
            >
              Pass Rate
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleSort("totalSubmissions")}
              className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer"
            >
              Runs
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>

          {/* Table Rows */}
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No challenges found matching your query.
            </div>
          ) : (
            filteredChallenges.map((challenge, idx) => (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.slug}`}
                className={`group block sm:grid sm:grid-cols-[50px_1fr_120px_180px_120px_120px] sm:items-center sm:gap-3 p-3.5 sm:px-5 sm:py-3 border-b border-white/[0.04] transition-all hover:bg-[#18181c] ${
                  idx % 2 === 0 ? "bg-transparent" : "bg-[#0e0e11]/30"
                }`}
              >
                {/* Mobile View */}
                <div className="sm:hidden space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                      {challenge.category}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getDifficultyBg(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors">
                    {challenge.title}
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{challenge.acceptanceRate}% pass rate</span>
                    <span>{formatNumber(challenge.totalSubmissions)} runs</span>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block font-mono text-xs">
                  {challenge.isCompleted ? (
                    <span className="text-emerald-400 font-semibold">[OK]</span>
                  ) : (
                    <span className="text-zinc-600">[--]</span>
                  )}
                </div>
                <div className="hidden sm:block min-w-0">
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate block">
                    {challenge.title}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getDifficultyBg(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="hidden sm:block text-xs text-zinc-400 truncate">
                  {challenge.category}
                </div>
                <div className="hidden sm:block text-xs font-mono text-zinc-300 font-medium">
                  {challenge.acceptanceRate}%
                </div>
                <div className="hidden sm:block text-xs font-mono text-zinc-500">
                  {formatNumber(challenge.totalSubmissions)}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

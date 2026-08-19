"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
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
    <div className="min-h-screen bg-[#000000] text-white font-mono">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#27272a]">
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              // INDEX_REPOSITORY: {initialChallenges.length} LABORATORY MODULES
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Assessment Catalogue
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mt-1 font-sans">
              Deterministic prompt engineering specifications evaluated against dual foundation models with criterion-level rubric scorecards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="border border-[#27272a] bg-[#0a0a0a] px-3.5 py-1.5 text-center">
              <div className="text-sm font-black text-white">{initialChallenges.length}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest">LABS</div>
            </div>
            <div className="border border-[#27272a] bg-[#0a0a0a] px-3.5 py-1.5 text-center">
              <div className="text-sm font-black text-white">{initialCategories.length}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest">TRACKS</div>
            </div>
            <div className="border border-[#27272a] bg-[#0a0a0a] px-3.5 py-1.5 text-center">
              <div className="text-sm font-black text-white">2</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest">MODELS</div>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="border border-[#27272a] bg-[#0a0a0a] p-4 mb-6 space-y-3">
          {/* Search & Difficulty */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">&gt;</span>
              <input
                type="text"
                placeholder="FILTER_SPECIFICATIONS (e.g. 'JSON', 'SECURITY')..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-[#27272a] bg-black py-2 pl-8 pr-8 text-xs text-white placeholder:text-zinc-600 focus:border-white focus:outline-none transition-all uppercase"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs font-bold"
                >
                  [CLEAR]
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
                    className={`border px-3 py-1 text-xs font-bold uppercase transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "border-white bg-white text-black"
                        : "border-[#27272a] bg-black text-zinc-400 hover:text-white hover:border-zinc-600"
                    }`}
                  >
                    [{diff}]
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories Strip */}
          <div className="pt-2.5 border-t border-[#27272a]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-2.5 py-1 text-xs font-bold uppercase shrink-0 transition-all border cursor-pointer ${
                  selectedCategory === "All"
                    ? "border-white bg-white text-black"
                    : "border-[#27272a] bg-black text-zinc-400 hover:text-white"
                }`}
              >
                00. ALL_DOMAINS ({initialChallenges.length})
              </button>

              {initialCategories.map((cat, idx) => {
                const isActive = selectedCategory === cat.slug;
                const count = initialChallenges.filter(c => c.categorySlug === cat.slug).length;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-2.5 py-1 text-xs font-bold uppercase shrink-0 transition-all border cursor-pointer ${
                      isActive
                        ? "border-white bg-white text-black"
                        : "border-[#27272a] bg-black text-zinc-400 hover:text-white"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}. {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-[#27272a]">
            <span>
              STATUS: <strong className="text-white">{filteredChallenges.length}</strong> matching specifications found
            </span>

            {(search || selectedDifficulty !== "All" || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedDifficulty("All");
                  setSelectedCategory("All");
                }}
                className="text-white hover:underline cursor-pointer font-bold"
              >
                [RESET_FILTERS]
              </button>
            )}
          </div>
        </div>

        {/* Challenges Table */}
        <div className="border border-[#27272a] bg-[#0a0a0a] overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[50px_1fr_120px_180px_120px_120px] items-center gap-3 px-5 py-2.5 border-b border-[#27272a] text-xs font-bold text-zinc-400 uppercase tracking-wider bg-black">
            <div>STAT</div>
            <button
              onClick={() => handleSort("title")}
              className="flex items-center gap-1 hover:text-white text-left cursor-pointer"
            >
              SPECIFICATION_TITLE
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleSort("difficulty")}
              className="flex items-center gap-1 hover:text-white cursor-pointer"
            >
              TIER
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <div>DOMAIN</div>
            <button
              onClick={() => handleSort("acceptanceRate")}
              className="flex items-center gap-1 hover:text-white cursor-pointer"
            >
              PASS_RATE
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleSort("totalSubmissions")}
              className="flex items-center gap-1 hover:text-white cursor-pointer"
            >
              RUNS
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>

          {/* Table Rows */}
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs font-bold">
              NO SPECIFICATIONS LOCATED MATCHING CRITERIA.
            </div>
          ) : (
            filteredChallenges.map((challenge, idx) => (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.slug}`}
                className={`group block sm:grid sm:grid-cols-[50px_1fr_120px_180px_120px_120px] sm:items-center sm:gap-3 p-3.5 sm:px-5 sm:py-3 border-b border-[#27272a]/60 transition-all hover:bg-[#141414] ${
                  idx % 2 === 0 ? "bg-[#0a0a0a]" : "bg-black"
                }`}
              >
                {/* Mobile View */}
                <div className="sm:hidden space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-zinc-400 border border-zinc-800 px-1.5 py-0.2">
                      {challenge.category}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 border ${getDifficultyBg(challenge.difficulty)}`}>
                      [{challenge.difficulty.toUpperCase()}]
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:underline uppercase">
                    {challenge.title}
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{challenge.acceptanceRate}% pass</span>
                    <span>{formatNumber(challenge.totalSubmissions)} runs</span>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block font-mono text-xs">
                  {challenge.isCompleted ? (
                    <span className="text-white font-black">[OK]</span>
                  ) : (
                    <span className="text-zinc-600">[--]</span>
                  )}
                </div>
                <div className="hidden sm:block min-w-0">
                  <span className="text-xs font-bold text-white group-hover:underline uppercase truncate block">
                    {challenge.title}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className={`text-[10px] px-2 py-0.5 border ${getDifficultyBg(challenge.difficulty)}`}>
                    [{challenge.difficulty.toUpperCase()}]
                  </span>
                </div>
                <div className="hidden sm:block text-xs text-zinc-400 truncate uppercase">
                  {challenge.category}
                </div>
                <div className="hidden sm:block text-xs font-bold text-white">
                  {challenge.acceptanceRate}%
                </div>
                <div className="hidden sm:block text-xs text-zinc-500">
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

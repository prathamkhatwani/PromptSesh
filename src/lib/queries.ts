import { prisma } from "@/lib/db";
import { Difficulty } from "@prisma/client";
import * as mock from "@/lib/mock-data";

export interface ChallengeFilter {
  search?: string;
  difficulty?: string;
  categorySlug?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

let lastDbCheckTime = 0;
let cachedDbStatus: boolean | null = null;
const DB_ONLINE_CACHE_MS = 60000;    // Re-check online status every 60s
const DB_OFFLINE_CACHE_MS = 300000;  // Cache offline status for 5 minutes (instant renders)

export async function checkDbConnection(): Promise<boolean> {
  const now = Date.now();
  const cacheDuration = cachedDbStatus === false ? DB_OFFLINE_CACHE_MS : DB_ONLINE_CACHE_MS;

  if (cachedDbStatus !== null && now - lastDbCheckTime < cacheDuration) {
    return cachedDbStatus;
  }

  try {
    const timeoutPromise = new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error("DB Timeout")), 3000)
    );
    const queryPromise = prisma.$queryRaw`SELECT 1`.then(() => true);

    cachedDbStatus = (await Promise.race([queryPromise, timeoutPromise])) as boolean;
  } catch (e) {
    cachedDbStatus = false;
  }

  lastDbCheckTime = now;
  return cachedDbStatus;
}

export async function getCategories() {
  const isConnected = await checkDbConnection();
  if (!isConnected) {
    return mock.categories;
  }

  try {
    const dbCategories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { challenges: true },
        },
      },
    });

    return dbCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon || "Zap",
      color: cat.color || "#22d3ee",
      challengeCount: cat._count.challenges,
    }));
  } catch (error) {
    console.error("Error fetching categories from DB, falling back to mock data", error);
    return mock.categories;
  }
}

export async function getChallenges(filters: ChallengeFilter = {}) {
  const isConnected = await checkDbConnection();
  if (!isConnected) {
    
    let filtered = [...mock.challenges];
    const { search, difficulty, categorySlug, sortField, sortDirection = "asc" } = filters;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    if (difficulty && difficulty !== "All") {
      const difficultyMapping: Record<string, string> = {
        EASY: "Easy",
        MEDIUM: "Medium",
        HARD: "Hard",
        EXPERT: "Expert",
      };
      const targetDiff = difficultyMapping[difficulty] || difficulty;
      filtered = filtered.filter((c) => c.difficulty === targetDiff);
    }

    if (categorySlug && categorySlug !== "All") {
      filtered = filtered.filter((c) => c.categorySlug === categorySlug);
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
  }

  try {
    const { search, difficulty, categorySlug, sortField, sortDirection = "asc" } = filters;

    const where: any = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (difficulty && difficulty !== "All") {
      let dbDifficulty: Difficulty = Difficulty.EASY;
      switch (difficulty.toUpperCase()) {
        case "EASY":
          dbDifficulty = Difficulty.EASY;
          break;
        case "MEDIUM":
          dbDifficulty = Difficulty.MEDIUM;
          break;
        case "HARD":
          dbDifficulty = Difficulty.HARD;
          break;
        case "EXPERT":
          dbDifficulty = Difficulty.EXPERT;
          break;
      }
      where.difficulty = dbDifficulty;
    }

    if (categorySlug && categorySlug !== "All") {
      where.category = {
        slug: categorySlug,
      };
    }

    let orderBy: any = { sortOrder: "asc" };
    if (sortField) {
      if (sortField === "title") {
        orderBy = { title: sortDirection };
      } else if (sortField === "acceptanceRate") {
        orderBy = { acceptanceRate: sortDirection };
      } else if (sortField === "totalSubmissions") {
        orderBy = { totalSubmissions: sortDirection };
      } else if (sortField === "difficulty") {
        orderBy = { difficulty: sortDirection };
      }
    }

    const dbChallenges = await prisma.challenge.findMany({
      where,
      orderBy,
      include: {
        category: true,
        rubric: {
          include: {
            criteria: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    return dbChallenges.map((ch) => ({
      id: ch.id,
      title: ch.title,
      slug: ch.slug,
      description: ch.description,
      fullDescription: ch.description,
      difficulty: ch.difficulty.charAt(0) + ch.difficulty.slice(1).toLowerCase() as any,
      category: ch.category.name,
      categorySlug: ch.category.slug,
      acceptanceRate: ch.acceptanceRate,
      totalSubmissions: ch.totalSubmissions,
      starterPrompt: ch.starterPrompt || undefined,
      testInputs: (ch.testInputs as any) || [],
      constraints: ch.constraints ? ch.constraints.split("\n") : [],
      hints: ch.hints || [],
      tags: [],
      isPremium: ch.isPremium,
      rubricCriteria: ch.rubric?.criteria.map((crit) => ({
        name: crit.name,
        weight: crit.weight,
        description: crit.description,
      })) || [],
    }));
  } catch (error) {
    console.error("Error fetching challenges from DB", error);
    return [];
  }
}

export async function getChallengeBySlug(slug: string) {
  const isConnected = await checkDbConnection();
  if (!isConnected) {
    return mock.getChallengeBySlug(slug) || null;
  }

  try {
    const ch = await prisma.challenge.findUnique({
      where: { slug },
      include: {
        category: true,
        rubric: {
          include: {
            criteria: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!ch) return null;

    return {
      id: ch.id,
      title: ch.title,
      slug: ch.slug,
      description: ch.description,
      fullDescription: ch.description,
      difficulty: ch.difficulty.charAt(0) + ch.difficulty.slice(1).toLowerCase() as any,
      category: ch.category.name,
      categorySlug: ch.category.slug,
      acceptanceRate: ch.acceptanceRate,
      totalSubmissions: ch.totalSubmissions,
      starterPrompt: ch.starterPrompt || undefined,
      testInputs: (ch.testInputs as any) || [],
      constraints: ch.constraints ? ch.constraints.split("\n") : [],
      hints: ch.hints || [],
      tags: [],
      isPremium: ch.isPremium,
      rubricCriteria: ch.rubric?.criteria.map((crit) => ({
        name: crit.name,
        weight: crit.weight,
        description: crit.description,
      })) || [],
    };
  } catch (error) {
    console.error(`Error fetching challenge by slug: ${slug}`, error);
    return mock.getChallengeBySlug(slug) || null;
  }
}

export async function getUserProfileData(
  userId?: string,
  sessionUser?: { name?: string | null; email?: string | null; image?: string | null }
) {
  const isConnected = await checkDbConnection();
  
  if (!isConnected || !userId) {
    const userName = sessionUser?.name || "Prompt Engineer (Demo)";
    const userEmail = sessionUser?.email || "engineer@promptsesh.com";
    return {
      user: {
        name: userName,
        email: userEmail,
        image: sessionUser?.image || undefined,
        role: "USER",
        joinedAt: "January 2026",
      },
      stats: {
        solvedCount: 0,
        totalSubmissions: 0,
        accuracyRate: 0,
        streakDays: 0,
        totalPoints: 0,
        globalRank: null,
      },
      badges: [
        { id: "b-1", name: "First Prompt", description: "Submit your first prompt engineering challenge", icon: "Sparkles", color: "from-cyan-500 to-blue-500", unlocked: false },
        { id: "b-2", name: "Zero-Shot Practitioner", description: "Complete 5 zero-shot prompting challenges", icon: "Zap", color: "from-purple-500 to-pink-500", unlocked: false },
        { id: "b-3", name: "Format Master", description: "Achieve 100% score on a structured JSON output challenge", icon: "CheckCircle2", color: "from-emerald-500 to-teal-500", unlocked: false },
        { id: "b-4", name: "5-Day Streak", description: "Maintain a 5-day continuous challenge streak", icon: "Flame", color: "from-amber-500 to-orange-500", unlocked: false },
        { id: "b-5", name: "Adversarial Defender", description: "Solve an Expert-level adversarial robustness challenge", icon: "ShieldAlert", color: "from-red-500 to-rose-600", unlocked: false },
        { id: "b-6", name: "Cross-Model Veteran", description: "Test prompts across 3 distinct LLM providers", icon: "Layers", color: "from-indigo-500 to-purple-600", unlocked: false },
      ],
      submissions: [],
    };
  }

  try {
    const dbUser = await (prisma.user as any).findUnique({
      where: { id: userId },
      include: {
        submissions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            challenge: true,
            modelTestResults: true,
          },
        },
        streaks: true,
        userBadges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!dbUser) return null;

    const userSubmissions: any[] = dbUser.submissions || [];
    const totalSubmissions = userSubmissions.length;
    const passedSubmissions = userSubmissions.filter((s: any) => s.passed);
    const solvedChallenges = new Set(passedSubmissions.map((s: any) => s.challengeId)).size;
    const accuracyRate = totalSubmissions > 0 ? (passedSubmissions.length / totalSubmissions) * 100 : 0;
    const streakDays = dbUser.streaks?.[0]?.currentStreak || 0;
    const userBadgesList: any[] = dbUser.userBadges || [];

    return {
      user: {
        name: dbUser.name || sessionUser?.name || "Engineer",
        email: dbUser.email || sessionUser?.email || "",
        image: dbUser.image || sessionUser?.image || undefined,
        role: dbUser.role,
        joinedAt: dbUser.createdAt ? new Date(dbUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recent",
      },
      stats: {
        solvedCount: solvedChallenges,
        totalSubmissions,
        accuracyRate: Math.round(accuracyRate * 10) / 10,
        streakDays,
        totalPoints: solvedChallenges * 100 + streakDays * 10,
        globalRank: Math.max(1, 15 - Math.floor(solvedChallenges / 2)),
      },
      badges: userBadgesList.map((ub: any) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon || "Sparkles",
        color: "from-cyan-500 to-blue-500",
        unlocked: true,
        unlockedAt: new Date(ub.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      })),
      submissions: userSubmissions.map((s: any) => ({
        id: s.id,
        challengeTitle: s.challenge.title,
        challengeSlug: s.challenge.slug,
        difficulty: s.challenge.difficulty.charAt(0) + s.challenge.difficulty.slice(1).toLowerCase(),
        score: Math.round(s.totalScore || 0),
        passed: s.passed,
        modelName: s.modelTestResults?.[0]?.modelName || "gemini-2.5-flash",
        createdAt: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      })),
    };
  } catch (error) {
    console.error("Error fetching user profile data", error);
    return null;
  }
}

export async function getLeaderboardData() {
  const isConnected = await checkDbConnection();

  if (!isConnected) {
    return [];
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        submissions: true,
        streaks: true,
      },
      take: 20,
    });

    const leaderboard = users.map((user: any) => {
      const submissions = user.submissions || [];
      const passedSubs = submissions.filter((s: any) => s.passed);
      const solvedCount = new Set(passedSubs.map((s: any) => s.challengeId)).size;
      const streakDays = user.streaks?.[0]?.currentStreak || 0;
      const totalPoints = solvedCount * 100 + streakDays * 10;
      const userAccuracy = submissions.length > 0
        ? Math.round((passedSubs.length / submissions.length) * 1000) / 10
        : 0;

      return {
        id: user.id,
        name: user.name || "Engineer",
        avatar: user.image || undefined,
        solvedCount,
        accuracyRate: userAccuracy,
        streakDays,
        totalPoints,
        badge: solvedCount > 20 ? "Grandmaster" : solvedCount > 10 ? "Practitioner" : "Novice",
      };
    });

    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    return leaderboard.map((item, idx) => ({ ...item, rank: idx + 1 }));
  } catch (error) {
    console.error("Error fetching leaderboard data", error);
    return [];
  }
}


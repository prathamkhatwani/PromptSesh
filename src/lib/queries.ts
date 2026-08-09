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
const DB_CHECK_CACHE_MS = 60000; // Cache status for 60 seconds

export async function checkDbConnection(): Promise<boolean> {
  const now = Date.now();
  if (cachedDbStatus !== null && now - lastDbCheckTime < DB_CHECK_CACHE_MS) {
    return cachedDbStatus;
  }

  try {
    const timeoutPromise = new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error("DB Timeout")), 300)
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
    console.log("⚠️ DB not reachable. Falling back to mock categories.");
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
    console.log("⚠️ DB not reachable. Falling back to mock challenges.");
    
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
    console.log(`⚠️ DB not reachable. Falling back to mock challenge for slug: ${slug}`);
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

export async function getUserProfileData(userId?: string) {
  const isConnected = await checkDbConnection();
  
  if (!isConnected || !userId) {
    return {
      user: {
        name: "Prompt Engineer",
        email: "engineer@promptcode.dev",
        role: "USER",
        joinedAt: "January 2026",
      },
      stats: {
        solvedCount: 12,
        totalSubmissions: 24,
        accuracyRate: 79.2,
        streakDays: 5,
        totalPoints: 1280,
      },
      badges: [
        {
          id: "b-1",
          name: "First Prompt",
          description: "Submitted your first prompt engineering challenge",
          icon: "Sparkles",
          color: "from-cyan-500 to-blue-500",
          unlocked: true,
          unlockedAt: "Jan 15, 2026",
        },
        {
          id: "b-2",
          name: "Zero-Shot Practitioner",
          description: "Completed 5 zero-shot prompting challenges",
          icon: "Zap",
          color: "from-purple-500 to-pink-500",
          unlocked: true,
          unlockedAt: "Jan 22, 2026",
        },
        {
          id: "b-3",
          name: "Format Master",
          description: "Achieved 100% score on a structured JSON output challenge",
          icon: "CheckCircle2",
          color: "from-emerald-500 to-teal-500",
          unlocked: true,
          unlockedAt: "Feb 01, 2026",
        },
        {
          id: "b-4",
          name: "5-Day Streak",
          description: "Maintained a 5-day continuous challenge streak",
          icon: "Flame",
          color: "from-amber-500 to-orange-500",
          unlocked: true,
          unlockedAt: "Feb 05, 2026",
        },
        {
          id: "b-5",
          name: "Adversarial Defender",
          description: "Solved an Expert-level adversarial robustness challenge",
          icon: "ShieldAlert",
          color: "from-red-500 to-rose-600",
          unlocked: false,
        },
        {
          id: "b-6",
          name: "Cross-Model Veteran",
          description: "Tested prompts across 3 distinct LLM providers",
          icon: "Layers",
          color: "from-indigo-500 to-purple-600",
          unlocked: false,
        },
      ],
      submissions: [
        {
          id: "sub-1",
          challengeTitle: "Text Summarizer",
          challengeSlug: "text-summarizer",
          difficulty: "Easy",
          score: 85,
          passed: true,
          modelName: "gpt-4o-mini",
          createdAt: "2 hours ago",
        },
        {
          id: "sub-2",
          challengeTitle: "Sentiment Classifier",
          challengeSlug: "sentiment-classifier",
          difficulty: "Easy",
          score: 95,
          passed: true,
          modelName: "gemini-1.5-flash",
          createdAt: "1 day ago",
        },
        {
          id: "sub-3",
          challengeTitle: "JSON Resume Parser",
          challengeSlug: "json-resume-parser",
          difficulty: "Medium",
          score: 90,
          passed: true,
          modelName: "gpt-4o-mini",
          createdAt: "3 days ago",
        },
        {
          id: "sub-4",
          challengeTitle: "Adversarial Math Trap",
          challengeSlug: "adversarial-math-trap",
          difficulty: "Expert",
          score: 65,
          passed: false,
          modelName: "gemini-1.5-flash",
          createdAt: "5 days ago",
        },
      ],
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
        name: dbUser.name || "Engineer",
        email: dbUser.email || "",
        role: dbUser.role,
        joinedAt: dbUser.createdAt ? new Date(dbUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recent",
      },
      stats: {
        solvedCount: solvedChallenges,
        totalSubmissions,
        accuracyRate: Math.round(accuracyRate * 10) / 10,
        streakDays,
        totalPoints: solvedChallenges * 100 + streakDays * 10,
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
        score: Math.round(s.totalScore),
        passed: s.passed,
        modelName: s.modelTestResults?.[0]?.modelName || "gpt-4o-mini",
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
    return [
      {
        rank: 1,
        name: "Sofia Rodriguez",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        solvedCount: 24,
        accuracyRate: 92.4,
        streakDays: 14,
        totalPoints: 2540,
        badge: "Grandmaster",
      },
      {
        rank: 2,
        name: "Alex Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        solvedCount: 21,
        accuracyRate: 88.1,
        streakDays: 8,
        totalPoints: 2180,
        badge: "Prompt Architect",
      },
      {
        rank: 3,
        name: "Marcus Vance",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        solvedCount: 19,
        accuracyRate: 85.0,
        streakDays: 9,
        totalPoints: 1990,
        badge: "Prompt Engineer",
      },
      {
        rank: 4,
        name: "Priya Sharma",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        solvedCount: 17,
        accuracyRate: 84.2,
        streakDays: 5,
        totalPoints: 1770,
        badge: "Practitioner",
      },
      {
        rank: 5,
        name: "Lukas Weber",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        solvedCount: 15,
        accuracyRate: 81.0,
        streakDays: 7,
        totalPoints: 1570,
        badge: "Practitioner",
      },
      {
        rank: 6,
        name: "Elena Rostova",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        solvedCount: 14,
        accuracyRate: 79.5,
        streakDays: 4,
        totalPoints: 1440,
        badge: "Practitioner",
      },
      {
        rank: 7,
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        solvedCount: 12,
        accuracyRate: 77.8,
        streakDays: 3,
        totalPoints: 1230,
        badge: "Novice",
      },
    ];
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        submissions: {
          where: { passed: true },
        },
        streaks: true,
      },
      take: 20,
    });

    const leaderboard = users.map((user) => {
      const solvedCount = new Set(user.submissions.map((s) => s.challengeId)).size;
      const streakDays = user.streaks?.[0]?.currentStreak || 0;
      const totalPoints = solvedCount * 100 + streakDays * 10;

      return {
        id: user.id,
        name: user.name || "Engineer",
        avatar: user.image || undefined,
        solvedCount,
        accuracyRate: 85.0,
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


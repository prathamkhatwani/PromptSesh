import { auth } from "@/lib/auth";
import { getUserProfileData } from "@/lib/queries";
import Link from "next/link";
import {
  User as UserIcon,
  Flame,
  Trophy,
  Target,
  BarChart2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  ShieldAlert,
  Layers,
  Lock,
  ArrowRight,
} from "lucide-react";
import { getDifficultyBg } from "@/lib/utils";

const badgeIconMap: Record<string, any> = {
  Sparkles,
  Zap,
  CheckCircle2,
  Flame,
  ShieldAlert,
  Layers,
};

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const profile = await getUserProfileData(userId);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="glass-card p-8 text-center max-w-md">
          <p className="text-slate-400 mb-4">Unable to load profile data.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const { user, stats, badges, submissions } = profile;

  return (
    <div className="min-h-screen pb-16">
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        {/* User Info Header */}
        <div className="glass-card p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-xl shadow-cyan-500/20 text-white font-bold text-2xl">
                  {user.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-dark-950 font-black text-xs shadow-md">
                  🔥
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-md px-2 py-0.5">
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{user.email}</p>
                <p className="text-xs text-slate-500 mt-1">Member since {user.joinedAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/challenges"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all"
              >
                Practice Challenges
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Solved Challenges
              </span>
              <Target className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">
              {stats.solvedCount}
            </div>
            <div className="text-xs text-slate-500">Across 9 skill categories</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Accuracy Rate
              </span>
              <BarChart2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">
              {stats.accuracyRate}%
            </div>
            <div className="text-xs text-slate-500">Based on {stats.totalSubmissions} submissions</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Streak
              </span>
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1 flex items-center gap-2">
              {stats.streakDays} <span className="text-xl text-amber-500">Days</span>
            </div>
            <div className="text-xs text-amber-400/80 font-medium">Keep solving daily to maintain streak</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Skill Points
              </span>
              <Trophy className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">
              {stats.totalPoints.toLocaleString()} <span className="text-xs font-normal text-slate-400">Pts</span>
            </div>
            <div className="text-xs text-slate-500">Global Rank #2</div>
          </div>
        </div>

        {/* Badges Collection Grid */}
        <div className="glass-card p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Badges & Achievements</h2>
              <p className="text-xs text-slate-400">Earn badges by solving challenges and maintaining daily streaks</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
              {badges.filter((b: any) => b.unlocked).length} / {badges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge: any) => {
              const IconComponent = badgeIconMap[badge.icon] || Sparkles;
              return (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-4 transition-all ${
                    badge.unlocked
                      ? "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]"
                      : "bg-dark-900/40 border-white/[0.03] opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg ${
                        badge.unlocked
                          ? `bg-gradient-to-br ${badge.color} text-white`
                          : "bg-dark-800 text-slate-600 border border-white/[0.04]"
                      }`}
                    >
                      {badge.unlocked ? (
                        <IconComponent className="h-6 w-6" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">{badge.name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {badge.description}
                      </p>
                      {badge.unlocked && (
                        <div className="text-[10px] font-mono text-cyan-400 pt-1">
                          Unlocked {badge.unlockedAt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submission History Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Submissions</h2>
              <p className="text-xs text-slate-400">History of your recent prompt evaluations</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.06] bg-dark-900/50 text-slate-500 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Challenge</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Model</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      {sub.passed ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-4 w-4" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-500 font-semibold">
                          <XCircle className="h-4 w-4" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      <Link
                        href={`/challenges/${sub.challengeSlug}`}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        {sub.challengeTitle}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium ${getDifficultyBg(sub.difficulty)}`}>
                        {sub.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {sub.score}%
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {sub.modelName}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {sub.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

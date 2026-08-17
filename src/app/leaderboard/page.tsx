import { getLeaderboardData } from "@/lib/queries";
import { Trophy, Crown } from "lucide-react";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboardData();

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen pb-16">
      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 mb-4">
            <Trophy className="h-3.5 w-3.5" /> Global Engineering Rankings
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Prompt Leaderboard
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Ranked by total solved challenges, qualitative rubric scores, and continuous daily streaks.
          </p>
        </div>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
            {/* 2nd Place */}
            <div className="glass-card-hover p-6 text-center order-2 md:order-1 relative overflow-hidden border-slate-400/20">
              <div className="absolute top-3 left-3 text-xs font-bold font-mono text-slate-400 bg-slate-500/10 border border-slate-400/20 px-2.5 py-1 rounded-md">
                RANK #2
              </div>
              <div className="relative inline-block mb-3 mt-4">
                {topThree[1].avatar ? (
                  <img
                    src={topThree[1].avatar}
                    alt={topThree[1].name}
                    className="h-20 w-20 rounded-full border-2 border-slate-300 shadow-lg mx-auto object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full border-2 border-slate-300 shadow-lg mx-auto flex items-center justify-center bg-slate-500/10 text-2xl font-bold text-slate-300">
                    {topThree[1].name.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-2 right-0 bg-slate-300 text-dark-950 font-black text-xs h-6 w-6 rounded-full flex items-center justify-center shadow">
                  2
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{topThree[1].name}</h3>
              <p className="text-xs text-slate-400 mb-4">{topThree[1].badge}</p>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-slate-500 font-medium text-[10px]">SOLVED</div>
                  <div className="text-white font-bold">{topThree[1].solvedCount}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium text-[10px]">STREAK</div>
                  <div className="text-amber-400 font-bold">{topThree[1].streakDays}d</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium text-[10px]">POINTS</div>
                  <div className="text-cyan-400 font-bold">{topThree[1].totalPoints}</div>
                </div>
              </div>
            </div>

            {/* 1st Place (Gold Highlight) */}
            <div className="glass-card-hover p-8 text-center order-1 md:order-2 relative overflow-hidden border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent shadow-2xl shadow-amber-500/10 transform md:-translate-y-4">
              <div className="absolute top-3 left-3 text-xs font-bold font-mono text-amber-400 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-md flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-amber-400" /> RANK #1
              </div>
              <div className="relative inline-block mb-3 mt-4">
                {topThree[0].avatar ? (
                  <img
                    src={topThree[0].avatar}
                    alt={topThree[0].name}
                    className="h-24 w-24 rounded-full border-4 border-amber-400 shadow-xl shadow-amber-500/20 mx-auto object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border-4 border-amber-400 shadow-xl shadow-amber-500/20 mx-auto flex items-center justify-center bg-amber-500/10 text-3xl font-bold text-amber-300">
                    {topThree[0].name.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-2 right-1 bg-amber-400 text-dark-950 font-black text-xs h-7 w-7 rounded-full flex items-center justify-center shadow-lg">
                  1
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-1">{topThree[0].name}</h3>
              <p className="text-xs text-amber-400 font-semibold mb-4">{topThree[0].badge}</p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-amber-200/70 font-medium text-[10px]">SOLVED</div>
                  <div className="text-white font-bold">{topThree[0].solvedCount}</div>
                </div>
                <div>
                  <div className="text-amber-200/70 font-medium text-[10px]">STREAK</div>
                  <div className="text-amber-400 font-bold">{topThree[0].streakDays}d</div>
                </div>
                <div>
                  <div className="text-amber-200/70 font-medium text-[10px]">POINTS</div>
                  <div className="text-cyan-400 font-bold">{topThree[0].totalPoints}</div>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="glass-card-hover p-6 text-center order-3 relative overflow-hidden border-amber-700/20">
              <div className="absolute top-3 left-3 text-xs font-bold font-mono text-amber-600 bg-amber-700/10 border border-amber-700/20 px-2.5 py-1 rounded-md">
                RANK #3
              </div>
              <div className="relative inline-block mb-3 mt-4">
                {topThree[2].avatar ? (
                  <img
                    src={topThree[2].avatar}
                    alt={topThree[2].name}
                    className="h-20 w-20 rounded-full border-2 border-amber-600 shadow-lg mx-auto object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full border-2 border-amber-600 shadow-lg mx-auto flex items-center justify-center bg-amber-700/10 text-2xl font-bold text-amber-500">
                    {topThree[2].name.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-2 right-0 bg-amber-700 text-white font-black text-xs h-6 w-6 rounded-full flex items-center justify-center shadow">
                  3
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{topThree[2].name}</h3>
              <p className="text-xs text-slate-400 mb-4">{topThree[2].badge}</p>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-slate-500 font-medium text-[10px]">SOLVED</div>
                  <div className="text-white font-bold">{topThree[2].solvedCount}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium text-[10px]">STREAK</div>
                  <div className="text-amber-400 font-bold">{topThree[2].streakDays}d</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium text-[10px]">POINTS</div>
                  <div className="text-cyan-400 font-bold">{topThree[2].totalPoints}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remaining Ranks Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Full Leaderboard Rankings</h2>
            <span className="text-xs text-slate-500">Live Updates</span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No Leaderboard Rankings Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                Be the first engineer to solve prompt challenges and claim the #1 spot on the global leaderboard!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.06] bg-dark-900/50 text-slate-500 font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Rank</th>
                    <th className="px-6 py-3.5">Engineer</th>
                    <th className="px-6 py-3.5">Badge Title</th>
                    <th className="px-6 py-3.5">Solved</th>
                    <th className="px-6 py-3.5">Accuracy</th>
                    <th className="px-6 py-3.5">Streak</th>
                    <th className="px-6 py-3.5 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                  {(topThree.length >= 3 ? remaining : leaderboard).map((user) => (
                    <tr key={user.rank} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-400">
                        #{user.rank}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-8 w-8 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
                              {user.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-semibold text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-400">
                          {user.badge}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-white">
                        {user.solvedCount}
                      </td>
                      <td className="px-6 py-4 font-mono text-emerald-400">
                        {user.accuracyRate}%
                      </td>
                      <td className="px-6 py-4 font-mono text-amber-400 font-medium">
                        🔥 {user.streakDays}d
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-cyan-400">
                        {user.totalPoints.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { getLeaderboardData } from "@/lib/queries";
import { Trophy, Crown } from "lucide-react";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboardData();

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen pb-16 bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 pb-6 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-[#141417] px-3 py-1 text-xs font-medium text-zinc-300 mb-3">
            <Trophy className="h-3.5 w-3.5 text-indigo-400" /> Global Engineering Rankings
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
            Engineering Leaderboard
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Rankings calibrated by completed challenge specifications, rubric precision index, and daily streak activity.
          </p>
        </div>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-end">
            {/* 2nd Place */}
            <div className="p-5 rounded-lg border border-white/[0.08] bg-[#121215] text-center order-2 md:order-1 shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400 border border-white/[0.08] bg-[#18181c] px-2 py-0.5 rounded inline-block mb-3">
                RANK #2
              </div>
              <div className="relative inline-block mb-3">
                {topThree[1].avatar ? (
                  <img
                    src={topThree[1].avatar}
                    alt={topThree[1].name}
                    className="h-16 w-16 rounded-full border border-white/[0.12] mx-auto object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full border border-white/[0.12] mx-auto flex items-center justify-center bg-[#18181c] text-lg font-semibold text-zinc-300">
                    {topThree[1].name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">{topThree[1].name}</h3>
              <p className="text-xs text-zinc-400 mb-3">{topThree[1].badge}</p>
              <div className="border border-white/[0.06] bg-[#18181c] rounded-md p-2.5 grid grid-cols-3 gap-1 text-center text-xs font-mono">
                <div>
                  <div className="text-zinc-500 text-[9px]">SOLVED</div>
                  <div className="text-zinc-200 font-semibold">{topThree[1].solvedCount}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px]">STREAK</div>
                  <div className="text-indigo-400 font-semibold">{topThree[1].streakDays}d</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px]">POINTS</div>
                  <div className="text-zinc-200 font-semibold">{topThree[1].totalPoints}</div>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="p-6 rounded-lg border border-indigo-500/30 bg-[#141418] text-center order-1 md:order-2 shadow-lg relative -translate-y-2">
              <div className="text-[10px] font-mono text-indigo-300 border border-indigo-500/30 bg-indigo-600/20 px-2.5 py-0.5 rounded inline-flex items-center gap-1 mb-3">
                <Crown className="h-3 w-3 text-indigo-400" /> RANK #1
              </div>
              <div className="relative inline-block mb-3">
                {topThree[0].avatar ? (
                  <img
                    src={topThree[0].avatar}
                    alt={topThree[0].name}
                    className="h-20 w-20 rounded-full border-2 border-indigo-500/40 shadow-xs mx-auto object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full border-2 border-indigo-500/40 mx-auto flex items-center justify-center bg-indigo-600/20 text-2xl font-semibold text-indigo-300">
                    {topThree[0].name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{topThree[0].name}</h3>
              <p className="text-xs text-indigo-400 font-medium mb-3">{topThree[0].badge}</p>
              <div className="border border-indigo-500/20 bg-[#18181c] rounded-md p-3 grid grid-cols-3 gap-1 text-center text-xs font-mono">
                <div>
                  <div className="text-zinc-500 text-[9px]">SOLVED</div>
                  <div className="text-white font-semibold">{topThree[0].solvedCount}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px]">STREAK</div>
                  <div className="text-indigo-400 font-semibold">{topThree[0].streakDays}d</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px]">POINTS</div>
                  <div className="text-white font-semibold">{topThree[0].totalPoints}</div>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="p-5 rounded-lg border border-white/[0.08] bg-[#121215] text-center order-3 shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400 border border-white/[0.08] bg-[#18181c] px-2 py-0.5 rounded inline-block mb-3">
                RANK #3
              </div>
              <div className="relative inline-block mb-3">
                {topThree[2].avatar ? (
                  <img
                    src={topThree[2].avatar}
                    alt={topThree[2].name}
                    className="h-16 w-16 rounded-full border border-white/[0.12] mx-auto object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full border border-white/[0.12] mx-auto flex items-center justify-center bg-[#18181c] text-lg font-semibold text-zinc-300">
                    {topThree[2].name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">{topThree[2].name}</h3>
              <p className="text-xs text-zinc-400 mb-3">{topThree[2].badge}</p>
              <div className="border border-white/[0.06] bg-[#18181c] rounded-md p-2.5 grid grid-cols-3 gap-1 text-center text-xs font-mono">
                <div>
                  <div className="text-zinc-500 text-[9px]">SOLVED</div>
                  <div className="text-zinc-200 font-semibold">{topThree[2].solvedCount}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px]">STREAK</div>
                  <div className="text-indigo-400 font-semibold">{topThree[2].streakDays}d</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px]">POINTS</div>
                  <div className="text-zinc-200 font-semibold">{topThree[2].totalPoints}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Rankings Table */}
        <div className="rounded-lg border border-white/[0.08] bg-[#121215] overflow-hidden shadow-sm">
          <div className="hidden sm:grid grid-cols-[80px_1fr_180px_100px_100px_120px] items-center gap-3 px-5 py-3 border-b border-white/[0.08] text-xs font-medium text-zinc-400 uppercase tracking-wider bg-[#0e0e11]">
            <div>Rank</div>
            <div>Engineer</div>
            <div>Specialization</div>
            <div>Solved</div>
            <div>Streak</div>
            <div className="text-right">Score</div>
          </div>

          <div className="divide-y border-white/[0.04]">
            {leaderboard.map((user, idx) => (
              <div
                key={user.id}
                className={`grid grid-cols-1 sm:grid-cols-[80px_1fr_180px_100px_100px_120px] items-center gap-3 p-3.5 sm:px-5 sm:py-3 transition-colors hover:bg-[#18181c] ${
                  idx < 3 ? "bg-[#141417]/40" : "bg-transparent"
                }`}
              >
                <div className="flex items-center gap-2 font-mono">
                  <span className={`text-xs font-medium ${idx === 0 ? "text-indigo-300" : "text-zinc-500"}`}>
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-5 w-5 rounded-full border border-white/[0.12] object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-white/[0.12] flex items-center justify-center bg-[#18181c] text-[10px] font-semibold text-zinc-300 shrink-0">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-zinc-100 truncate">
                    {user.name}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 truncate">
                  {user.badge}
                </div>
                <div className="text-xs text-zinc-300 font-mono">
                  {user.solvedCount}
                </div>
                <div className="text-xs text-indigo-400 font-mono">
                  {user.streakDays}d
                </div>
                <div className="text-xs font-mono font-medium text-zinc-100 sm:text-right">
                  {user.totalPoints.toLocaleString()} PTS
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

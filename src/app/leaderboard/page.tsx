import { getLeaderboardData } from "@/lib/queries";
import { Trophy, Crown } from "lucide-react";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboardData();

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen pb-16 bg-[#000000] text-white font-mono">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 pb-6 border-b border-[#27272a]">
          <div className="inline-block border border-white bg-black px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest mb-3">
            GLOBAL MERIT REGISTRY // SYSTEM 01
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase">
            Engineering Leaderboard
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans">
            Rankings calibrated by completed challenge specifications, rubric precision index, and daily streak activity.
          </p>
        </div>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-end">
            {/* 2nd Place */}
            <div className="p-5 border border-[#27272a] bg-[#0a0a0a] text-center order-2 md:order-1">
              <div className="text-[10px] font-bold text-zinc-300 border border-zinc-700 bg-black px-2 py-0.5 inline-block mb-3 uppercase">
                RANK #02
              </div>
              <div className="relative inline-block mb-3">
                {topThree[1].avatar ? (
                  <img
                    src={topThree[1].avatar}
                    alt={topThree[1].name}
                    className="h-16 w-16 border border-zinc-700 mx-auto object-cover grayscale"
                  />
                ) : (
                  <div className="h-16 w-16 border border-zinc-700 mx-auto flex items-center justify-center bg-zinc-900 text-lg font-black text-white">
                    {topThree[1].name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-bold text-white mb-1 uppercase">{topThree[1].name}</h3>
              <p className="text-xs text-zinc-400 mb-3">{topThree[1].badge}</p>
              <div className="border border-zinc-800 bg-black p-2.5 grid grid-cols-3 gap-1 text-center text-xs">
                <div>
                  <div className="text-zinc-500 text-[9px]">SOLVED</div>
                  <div className="text-white font-bold">{topThree[1].solvedCount}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px]">STREAK</div>
                  <div className="text-white font-bold">{topThree[1].streakDays}d</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px]">POINTS</div>
                  <div className="text-white font-bold">{topThree[1].totalPoints}</div>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="p-6 border-2 border-white bg-black text-center order-1 md:order-2 relative -translate-y-2">
              <div className="text-[10px] font-black text-black bg-white px-2.5 py-0.5 inline-flex items-center gap-1 mb-3 uppercase">
                <Crown className="h-3 w-3 text-black" /> RANK #01 LAUREATE
              </div>
              <div className="relative inline-block mb-3">
                {topThree[0].avatar ? (
                  <img
                    src={topThree[0].avatar}
                    alt={topThree[0].name}
                    className="h-20 w-20 border-2 border-white mx-auto object-cover grayscale"
                  />
                ) : (
                  <div className="h-20 w-20 border-2 border-white mx-auto flex items-center justify-center bg-white text-2xl font-black text-black">
                    {topThree[0].name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-base font-black text-white mb-1 uppercase">{topThree[0].name}</h3>
              <p className="text-xs text-zinc-300 font-bold mb-3">{topThree[0].badge}</p>
              <div className="border border-zinc-700 bg-[#121212] p-3 grid grid-cols-3 gap-1 text-center text-xs">
                <div>
                  <div className="text-zinc-400 text-[9px]">SOLVED</div>
                  <div className="text-white font-black">{topThree[0].solvedCount}</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[9px]">STREAK</div>
                  <div className="text-white font-black">{topThree[0].streakDays}d</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[9px]">POINTS</div>
                  <div className="text-white font-black">{topThree[0].totalPoints}</div>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="p-5 border border-[#27272a] bg-[#0a0a0a] text-center order-3">
              <div className="text-[10px] font-bold text-zinc-300 border border-zinc-700 bg-black px-2 py-0.5 inline-block mb-3 uppercase">
                RANK #03
              </div>
              <div className="relative inline-block mb-3">
                {topThree[2].avatar ? (
                  <img
                    src={topThree[2].avatar}
                    alt={topThree[2].name}
                    className="h-16 w-16 border border-zinc-700 mx-auto object-cover grayscale"
                  />
                ) : (
                  <div className="h-16 w-16 border border-zinc-700 mx-auto flex items-center justify-center bg-zinc-900 text-lg font-black text-white">
                    {topThree[2].name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-bold text-white mb-1 uppercase">{topThree[2].name}</h3>
              <p className="text-xs text-zinc-400 mb-3">{topThree[2].badge}</p>
              <div className="border border-zinc-800 bg-black p-2.5 grid grid-cols-3 gap-1 text-center text-xs">
                <div>
                  <div className="text-zinc-500 text-[9px]">SOLVED</div>
                  <div className="text-white font-bold">{topThree[2].solvedCount}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px]">STREAK</div>
                  <div className="text-white font-bold">{topThree[2].streakDays}d</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[9px]">POINTS</div>
                  <div className="text-white font-bold">{topThree[2].totalPoints}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Rankings Table */}
        <div className="border border-[#27272a] bg-[#0a0a0a] overflow-hidden">
          <div className="hidden sm:grid grid-cols-[80px_1fr_180px_100px_100px_120px] items-center gap-3 px-5 py-2.5 border-b border-[#27272a] text-xs font-bold text-zinc-400 uppercase tracking-wider bg-black">
            <div>RANK</div>
            <div>PRACTITIONER</div>
            <div>SPECIALTY</div>
            <div>SOLVED</div>
            <div>STREAK</div>
            <div className="text-right">SCORE_PTS</div>
          </div>

          <div className="divide-y border-[#27272a]/60">
            {leaderboard.map((user, idx) => (
              <div
                key={user.id}
                className={`grid grid-cols-1 sm:grid-cols-[80px_1fr_180px_100px_100px_120px] items-center gap-3 p-3.5 sm:px-5 sm:py-3 transition-colors hover:bg-[#141414] ${
                  idx === 0 ? "bg-[#141414] text-white" : idx % 2 === 0 ? "bg-[#0a0a0a]" : "bg-black"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-5 w-5 border border-zinc-700 object-cover shrink-0 grayscale"
                    />
                  ) : (
                    <div className="h-5 w-5 border border-zinc-700 flex items-center justify-center bg-black text-[10px] font-bold text-white shrink-0">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-bold text-white uppercase truncate">
                    {user.name}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 truncate uppercase">
                  {user.badge}
                </div>
                <div className="text-xs text-white font-bold">
                  {user.solvedCount}
                </div>
                <div className="text-xs text-white font-bold">
                  {user.streakDays}d
                </div>
                <div className="text-xs font-black text-white sm:text-right">
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

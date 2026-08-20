import { Trophy, Crown, Flame, Code2 } from "lucide-react";
import { getLeaderboardData } from "@/lib/queries";

export default async function LeaderboardPage() {
  const leaders = await getLeaderboardData();

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  // Reorder for podium: 2nd, 1st, 3rd
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  const rankColors: Record<number, string> = {
    1: "border-emerald-500 bg-emerald-500/[0.06]",
    2: "border-slate-400/40 bg-slate-400/[0.04]",
    3: "border-amber-600/40 bg-amber-600/[0.04]",
  };

  const rankBadgeColors: Record<number, string> = {
    1: "bg-emerald-500 text-slate-900",
    2: "bg-slate-400 text-slate-900",
    3: "bg-amber-600 text-slate-900",
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
            <Trophy className="h-3 w-3" />
            Global Rankings
          </span>
          <h1 className="mt-3 font-sans text-3xl font-bold text-white sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Top engineers ranked by challenges solved, streaks, and total score.
          </p>
        </div>

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <div className="mb-12 grid grid-cols-3 items-end gap-3 sm:gap-5">
            {podiumOrder.map((user, i) => {
              const actualRank = i === 1 ? 1 : i === 0 ? 2 : 3;
              const isFirst = actualRank === 1;

              return (
                <div
                  key={user.id}
                  className={`relative flex flex-col items-center rounded-lg border p-4 sm:p-6 transition-colors duration-200 ${
                    rankColors[actualRank]
                  } ${isFirst ? "-translate-y-2" : ""}`}
                >
                  {isFirst && (
                    <Crown className="absolute -top-3 h-6 w-6 text-emerald-400" />
                  )}

                  {/* Avatar */}
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold sm:h-14 sm:w-14 ${
                      isFirst
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                        : "border-white/[0.14] bg-[#243044] text-slate-300"
                    }`}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      user.name?.[0]?.toUpperCase() ?? "?"
                    )}
                  </div>

                  {/* Name */}
                  <span className="mb-1 text-center text-sm font-semibold text-white truncate max-w-full">
                    {user.name}
                  </span>

                  {/* Rank Badge */}
                  <span
                    className={`mb-3 inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${rankBadgeColors[actualRank]}`}
                  >
                    #{actualRank}
                  </span>

                  {/* Stats */}
                  <div className="flex w-full flex-col gap-1.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                      <Code2 className="h-3 w-3 text-emerald-400" />
                      <span>
                        <span className="font-semibold text-white">
                          {user.solvedCount}
                        </span>{" "}
                        solved
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                      <Flame className="h-3 w-3 text-amber-500" />
                      <span>
                        <span className="font-semibold text-white">
                          {user.streakDays}d
                        </span>{" "}
                        streak
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-lg font-bold text-emerald-400">
                      {user.totalPoints.toLocaleString()}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      points
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Rankings Table */}
        <div className="rounded-lg border border-white/[0.08] bg-[#192134]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="whitespace-nowrap px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Rank
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Engineer
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Specialization
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Solved
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Streak
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((user, index) => {
                  const rank = index + 1;
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-white/[0.05] transition-colors duration-150 hover:bg-[#243044]"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        {rank <= 3 ? (
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold ${rankBadgeColors[rank]}`}
                          >
                            {rank}
                          </span>
                        ) : (
                          <span className="pl-1.5 font-mono text-xs text-slate-500">
                            {rank}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-[#243044] text-xs font-semibold text-slate-300">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              user.name?.[0]?.toUpperCase() ?? "?"
                            )}
                          </div>
                          <span className="font-medium text-white">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                        {user.badge ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-white">
                        {user.solvedCount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-white">
                          <Flame className="h-3 w-3 text-amber-500" />
                          {user.streakDays}d
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-semibold text-emerald-400">
                        {user.totalPoints.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

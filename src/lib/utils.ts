import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDifficultyBg(difficulty: string): string {
  if (!difficulty) return "";
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 font-mono text-[10px]";
    case "medium":
      return "bg-amber-500/12 text-amber-400 border border-amber-500/25 font-mono text-[10px]";
    case "hard":
      return "bg-red-500/12 text-red-400 border border-red-500/25 font-mono text-[10px]";
    case "expert":
      return "bg-purple-500/15 text-purple-400 border border-purple-500/30 font-mono text-[10px]";
    default:
      return "bg-slate-500/10 text-slate-400 border border-slate-500/20 font-mono text-[10px]";
  }
}

export function getDifficultyDot(difficulty: string): string {
  if (!difficulty) return "";
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-emerald-400";
    case "medium":
      return "bg-amber-400";
    case "hard":
      return "bg-red-400";
    case "expert":
      return "bg-purple-400";
    default:
      return "bg-slate-500";
  }
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

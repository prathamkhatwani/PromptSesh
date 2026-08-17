import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDifficultyBg(difficulty: string): string {
  if (!difficulty) return "";
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
    case "medium":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
    case "hard":
      return "bg-orange-500/15 text-orange-400 border border-orange-500/20";
    case "expert":
      return "bg-red-500/15 text-red-400 border border-red-500/20";
    default:
      return "bg-slate-500/15 text-slate-400 border border-slate-500/20";
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
      return "bg-orange-400";
    case "expert":
      return "bg-red-400";
    default:
      return "bg-slate-400";
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

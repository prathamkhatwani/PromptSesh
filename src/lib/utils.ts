import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDifficultyBg(difficulty: string): string {
  if (!difficulty) return "";
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-transparent text-zinc-400 border border-zinc-800 font-mono text-[10px] uppercase font-bold";
    case "medium":
      return "bg-zinc-900 text-zinc-200 border border-zinc-600 font-mono text-[10px] uppercase font-bold";
    case "hard":
      return "bg-zinc-200 text-black border border-white font-mono text-[10px] uppercase font-extrabold";
    case "expert":
      return "bg-white text-black border border-white font-mono text-[10px] uppercase font-black tracking-wider";
    default:
      return "bg-transparent text-zinc-500 border border-zinc-800 font-mono text-[10px] uppercase";
  }
}

export function getDifficultyDot(difficulty: string): string {
  if (!difficulty) return "";
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-zinc-400";
    case "medium":
      return "bg-zinc-200";
    case "hard":
      return "bg-white";
    case "expert":
      return "bg-white";
    default:
      return "bg-zinc-600";
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

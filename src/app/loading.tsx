export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-dark-950"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
        </div>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">
          Loading PromptSesh...
        </span>
      </div>
    </div>
  );
}

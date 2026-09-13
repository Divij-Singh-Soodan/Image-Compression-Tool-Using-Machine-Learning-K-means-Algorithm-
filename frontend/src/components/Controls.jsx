const K_CHIPS = [4, 8, 16, 32];

export default function Controls({
  k,
  maxIters,
  onKChange,
  onMaxItersChange,
  onSubmit,
  loading,
  elapsedMs,
  canSubmit,
}) {
  return (
    <section className="animate-fade-up rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6 space-y-6">
      <div>
        <div className="flex items-end justify-between gap-3 mb-3">
          <label className="text-sm font-medium text-zinc-300">
            Colors (K)
          </label>
          <span className="font-mono text-cyan-400 text-sm tabular-nums">{k}</span>
        </div>
        <input
          type="range"
          min={2}
          max={64}
          value={k}
          disabled={loading}
          onChange={(e) => onKChange(Number(e.target.value))}
          className="slider-accent w-full"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {K_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={loading}
              onClick={() => onKChange(chip)}
              className={[
                "rounded-md px-3 py-1 text-xs font-mono transition-colors",
                k === chip
                  ? "bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/40"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 ring-1 ring-zinc-700",
              ].join(" ")}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between gap-3 mb-3">
          <label className="text-sm font-medium text-zinc-300">
            Iterations
          </label>
          <span className="font-mono text-cyan-400 text-sm tabular-nums">
            {maxIters}
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={20}
          value={maxIters}
          disabled={loading}
          onChange={(e) => onMaxItersChange(Number(e.target.value))}
          className="slider-accent w-full"
        />
        <p className="mt-2 text-xs text-zinc-500">
          More iterations refine centroids; diminishing returns after ~10–15.
        </p>
      </div>

      <button
        type="button"
        disabled={!canSubmit || loading}
        onClick={onSubmit}
        className={[
          "relative w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition-all",
          canSubmit && !loading
            ? "bg-cyan-400 text-zinc-950 hover:bg-cyan-300 shadow-glow"
            : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
        ].join(" ")}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
              />
            </svg>
            Compressing… {(elapsedMs / 1000).toFixed(1)}s
          </span>
        ) : (
          "Compress with K-Means"
        )}
      </button>
    </section>
  );
}

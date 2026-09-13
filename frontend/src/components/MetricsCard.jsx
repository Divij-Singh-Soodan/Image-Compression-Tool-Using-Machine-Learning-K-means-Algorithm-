function formatBits(bits) {
  if (bits >= 1_000_000) return `${(bits / 1_000_000).toFixed(2)} Mb`;
  if (bits >= 1_000) return `${(bits / 1_000).toFixed(1)} Kb`;
  return `${bits} b`;
}

export default function MetricsCard({ metrics, onDownload }) {
  if (!metrics) return null;

  const cards = [
    {
      label: "Original bits",
      value: formatBits(metrics.original_bits),
      sub: `${metrics.original_bits.toLocaleString()} bits`,
    },
    {
      label: "Compressed bits",
      value: formatBits(metrics.compressed_bits),
      sub: `${metrics.compressed_bits.toLocaleString()} bits`,
    },
    {
      label: "Compression factor",
      value: `${metrics.compression_ratio.toFixed(2)}×`,
      sub: `${metrics.percent_saved.toFixed(1)}% bits saved`,
    },
    {
      label: "Latency",
      value: `${metrics.processing_time_ms.toFixed(0)} ms`,
      sub:
        metrics.width && metrics.height
          ? `${metrics.width}×${metrics.height} · K=${metrics.K}`
          : "server processing",
    },
  ];

  return (
    <section className="animate-fade-up space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-zinc-100">
          Compression Metrics
        </h2>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 ring-1 ring-zinc-700 transition hover:bg-zinc-700 hover:text-cyan-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12L12 16.5m0 0L16.5 12M12 16.5V3"
            />
          </svg>
          Download Compressed Image
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">
              {card.label}
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-zinc-50 tabular-nums">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-zinc-500 font-mono">{card.sub}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-600 leading-relaxed">
        Theoretical size from course notes: uncompressed = H×W×24; compressed =
        (K×24) + (H×W×⌈log₂(K)⌉). Actual PNG file size may differ due to
        encoding overhead.
      </p>
    </section>
  );
}

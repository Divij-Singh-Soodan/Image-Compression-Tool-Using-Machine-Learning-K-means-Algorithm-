import { useState } from "react";

export default function PaletteViewer({ palette }) {
  const [copiedHex, setCopiedHex] = useState(null);

  if (!palette?.length) return null;

  const copyHex = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      window.setTimeout(() => setCopiedHex(null), 1400);
    } catch {
      setCopiedHex(null);
    }
  };

  return (
    <section className="animate-fade-up space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-zinc-100">
          Color Palette
        </h2>
        <p className="text-xs text-zinc-500 font-mono">
          {palette.length} centroids · click to copy
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {palette.map((color, i) => (
          <button
            key={`${color.hex}-${i}`}
            type="button"
            title={`${color.hex} — RGB(${color.rgb.join(", ")})`}
            onClick={() => copyHex(color.hex)}
            className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-zinc-700 transition hover:ring-cyan-400/50 hover:scale-[1.03]"
            style={{ backgroundColor: color.hex }}
          >
            <span className="absolute inset-x-0 bottom-0 bg-zinc-950/75 py-1 text-center text-[9px] font-mono text-zinc-200 opacity-0 transition group-hover:opacity-100">
              {color.hex}
            </span>
            {copiedHex === color.hex && (
              <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/70 text-[10px] font-semibold text-cyan-300">
                Copied!
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

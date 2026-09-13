import { useCallback, useEffect, useRef, useState } from "react";

export default function ImageSlider({ originalSrc, compressedSrc }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updateFromClientX(clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateFromClientX]);

  if (!originalSrc || !compressedSrc) return null;

  return (
    <section className="animate-fade-up space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-zinc-100">
          Before / After
        </h2>
        <p className="text-xs text-zinc-500 font-mono">Drag the handle</p>
      </div>

      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-glow"
        onMouseDown={(e) => {
          dragging.current = true;
          updateFromClientX(e.clientX);
        }}
        onTouchStart={(e) => {
          dragging.current = true;
          updateFromClientX(e.touches[0].clientX);
        }}
      >
        <img
          src={compressedSrc}
          alt="Compressed"
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={originalSrc}
            alt="Original"
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-cyan-400 bg-zinc-950 text-cyan-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" d="M8 12H4m16 0h-4M9 8l-4 4 4 4m6-8l4 4-4 4" />
            </svg>
          </div>
        </div>

        <span className="absolute left-3 top-3 rounded-md bg-zinc-950/80 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-300 font-mono ring-1 ring-zinc-700">
          Original
        </span>
        <span className="absolute right-3 top-3 rounded-md bg-zinc-950/80 px-2 py-1 text-[10px] uppercase tracking-wider text-cyan-300 font-mono ring-1 ring-cyan-400/30">
          Compressed
        </span>
      </div>
    </section>
  );
}

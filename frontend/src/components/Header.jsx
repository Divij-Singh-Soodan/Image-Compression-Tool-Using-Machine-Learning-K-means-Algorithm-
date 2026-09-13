export default function Header() {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 ring-1 ring-zinc-700">
            <span className="absolute h-3 w-3 rounded-full bg-cyan-400 -translate-x-1.5" />
            <span className="absolute h-3 w-3 rounded-full bg-violet-400 translate-x-1.5 opacity-90" />
            <span className="absolute h-2.5 w-2.5 rounded-full bg-fuchsia-400 translate-y-2" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-zinc-50 sm:text-xl">
              ChromaCompress
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              K-Means color quantization
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-xs text-zinc-500 font-mono">
          Unsupervised ML · Vector Quantization
        </span>
      </div>
    </header>
  );
}

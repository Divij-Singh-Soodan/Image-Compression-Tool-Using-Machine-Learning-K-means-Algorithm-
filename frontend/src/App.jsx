import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Dropzone from "./components/Dropzone.jsx";
import Controls from "./components/Controls.jsx";
import ImageSlider from "./components/ImageSlider.jsx";
import PaletteViewer from "./components/PaletteViewer.jsx";
import MetricsCard from "./components/MetricsCard.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [k, setK] = useState(16);
  const [maxIters, setMaxIters] = useState(10);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [previewUrl]);

  const onFileSelect = useCallback((selected) => {
    setFile(selected);
    setResult(null);
    setError("");
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(selected);
    });
  }, []);

  const compress = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError("");
    setElapsedMs(0);
    const started = performance.now();
    timerRef.current = window.setInterval(() => {
      setElapsedMs(performance.now() - started);
    }, 100);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("k", String(k));
      form.append("max_iters", String(maxIters));

      const res = await fetch(`${API_BASE}/api/compress`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let detail = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
        } catch {
          /* ignore parse errors */
        }
        throw new Error(detail);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Compression failed");
      setResult(null);
    } finally {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedMs(performance.now() - started);
      setLoading(false);
    }
  };

  const downloadCompressed = () => {
    if (!result?.compressed_image) return;
    const link = document.createElement("a");
    link.href = result.compressed_image;
    link.download = `chromacompress_k${k}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
        <div className="max-w-2xl animate-fade-up">
          <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Compress color, keep character
          </h2>
          <p className="mt-3 text-zinc-400 leading-relaxed">
            Reduce any image to{" "}
            <span className="text-cyan-400 font-medium">K representative colors</span>{" "}
            using an unsupervised K-Means clustering pipeline — grouping pixel
            distributions in RGB space to compress visual footprint while
            preserving core structure.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Dropzone
            file={file}
            previewUrl={previewUrl}
            onFileSelect={onFileSelect}
            disabled={loading}
          />
          <Controls
            k={k}
            maxIters={maxIters}
            onKChange={setK}
            onMaxItersChange={setMaxIters}
            onSubmit={compress}
            loading={loading}
            elapsedMs={elapsedMs}
            canSubmit={Boolean(file)}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
          >
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-8 pb-12">
            <ImageSlider
              originalSrc={result.original_image}
              compressedSrc={result.compressed_image}
            />
            <PaletteViewer palette={result.palette} />
            <MetricsCard metrics={result.metrics} onDownload={downloadCompressed} />
          </div>
        )}
      </main>
    </div>
  );
}

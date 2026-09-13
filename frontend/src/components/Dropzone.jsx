import { useCallback, useRef, useState } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXT = [".jpg", ".jpeg", ".png", ".webp"];

function isValidImage(file) {
  if (!file) return false;
  if (ACCEPTED.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED_EXT.some((ext) => name.endsWith(ext));
}

export default function Dropzone({ file, previewUrl, onFileSelect, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback(
    (selected) => {
      if (!selected) return;
      if (!isValidImage(selected)) {
        setError("Please upload a JPEG, PNG, or WEBP image.");
        return;
      }
      setError("");
      onFileSelect(selected);
    },
    [onFileSelect]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    handleFile(dropped);
  };

  return (
    <div className="animate-fade-up">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={[
          "relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200",
          dragging
            ? "border-cyan-400 bg-cyan-400/5 shadow-glow"
            : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500",
          disabled ? "opacity-60 pointer-events-none" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {previewUrl ? (
          <div className="relative aspect-[16/10] w-full">
            <img
              src={previewUrl}
              alt="Upload preview"
              className="h-full w-full object-contain bg-zinc-950"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-4">
              <p className="truncate text-sm font-medium text-zinc-200">
                {file?.name}
              </p>
              <p className="text-xs text-zinc-500 font-mono">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : ""} · click or drop to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700 animate-pulse-ring">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-7 w-7 text-cyan-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-medium text-zinc-200">
                Drop an image here, or click to browse
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                JPEG, PNG, or WEBP · large images auto-resized for speed
              </p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

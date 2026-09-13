"""
ChromaCompress FastAPI application.

Endpoints:
  POST /api/compress  – K-Means color quantization of an uploaded image
  GET  /api/health    – Health check
"""

from __future__ import annotations

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .ml_engine import compress_image_pipeline
from .schemas import CompressResponse, HealthResponse

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/x-png",
}

app = FastAPI(
    title="ChromaCompress",
    description="Interactive image compression via unsupervised K-Means color quantization",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", service="ChromaCompress")


@app.post("/api/compress", response_model=CompressResponse)
async def compress(
    file: UploadFile = File(...),
    k: int = Form(16),
    max_iters: int = Form(10),
) -> CompressResponse:
    if k < 2 or k > 64:
        raise HTTPException(status_code=400, detail="k must be between 2 and 64")
    if max_iters < 5 or max_iters > 20:
        raise HTTPException(status_code=400, detail="max_iters must be between 5 and 20")

    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()
    extension_ok = filename.endswith((".jpg", ".jpeg", ".png", ".webp"))
    if content_type not in ALLOWED_CONTENT_TYPES and not extension_ok:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload JPEG, PNG, or WEBP.",
        )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(image_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 25 MB)")

    try:
        result = compress_image_pipeline(image_bytes, K=k, max_iters=max_iters)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Compression failed: {exc}") from exc

    return CompressResponse(**result)

"""Pydantic response schemas for the ChromaCompress API."""

from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class PaletteColor(BaseModel):
    hex: str = Field(..., description="CSS hex color, e.g. #A1B2C3")
    rgb: List[int] = Field(..., min_length=3, max_length=3, description="RGB triplet 0-255")


class CompressionMetrics(BaseModel):
    original_bits: int
    compressed_bits: int
    compression_ratio: float
    percent_saved: float
    processing_time_ms: float
    height: int | None = None
    width: int | None = None
    K: int | None = None
    max_iters: int | None = None
    bits_per_index: int | None = None


class CompressResponse(BaseModel):
    original_image: str = Field(..., description="Base64 PNG data URL of the (resized) original")
    compressed_image: str = Field(..., description="Base64 PNG data URL of the quantized image")
    palette: List[PaletteColor]
    metrics: CompressionMetrics


class HealthResponse(BaseModel):
    status: str
    service: str = "ChromaCompress"

"""
K-Means clustering engine for ChromaCompress.

Implements the exact algorithm logic from the Stanford Unsupervised Learning
Assignment (find_closest_centroids, compute_centroids, run_kMeans,
kMeans_init_centroids) plus a production image-compression pipeline.
"""

from __future__ import annotations

import base64
import io
import math
import time
from typing import Any

import numpy as np
from PIL import Image


# ---------------------------------------------------------------------------
# Graded / assignment functions
# ---------------------------------------------------------------------------

def find_closest_centroids(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    """
    Computes the centroid memberships for every example (lab loop version).

    Args:
        X: (m, n) Input values
        centroids: (K, n) centroids

    Returns:
        idx: (m,) closest centroids
    """
    K = centroids.shape[0]
    idx = np.zeros(X.shape[0], dtype=int)

    for i in range(X.shape[0]):
        distance = []
        for j in range(K):
            norm_ij = np.linalg.norm(X[i] - centroids[j])
            distance.append(norm_ij)
        idx[i] = np.argmin(distance)

    return idx


def find_closest_centroids_vectorized(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    """
    Vectorized closest-centroid assignment for real-time image compression.

    Equivalent to find_closest_centroids but uses broadcasting:
        ||X[i] - centroids[j]|| via np.linalg.norm over axis=2.
    """
    distances = np.linalg.norm(
        X[:, np.newaxis, :] - centroids[np.newaxis, :, :],
        axis=2,
    )
    return np.argmin(distances, axis=1)


def compute_centroids(X: np.ndarray, idx: np.ndarray, K: int) -> np.ndarray:
    """
    Returns the new centroids by computing the means of the data points
    assigned to each centroid.

    Empty clusters are re-initialized by sampling a random point from X
    (production safeguard beyond the lab starter code).

    Args:
        X: (m, n) Data points
        idx: (m,) Array containing index of closest centroid for each example
        K: number of centroids

    Returns:
        centroids: (K, n) New centroids computed
    """
    m, n = X.shape
    centroids = np.zeros((K, n))

    for k in range(K):
        points = X[idx == k]
        if points.shape[0] == 0:
            centroids[k] = X[np.random.randint(0, m)]
        else:
            centroids[k] = np.mean(points, axis=0)

    return centroids


def run_kMeans(
    X: np.ndarray,
    initial_centroids: np.ndarray,
    max_iters: int = 10,
    use_vectorized: bool = True,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Runs the K-Means algorithm on data matrix X, where each row of X
    is a single example. Alternates find_closest_centroids and compute_centroids.
    """
    m, n = X.shape
    K = initial_centroids.shape[0]
    centroids = initial_centroids.copy()
    idx = np.zeros(m, dtype=int)

    assign_fn = (
        find_closest_centroids_vectorized if use_vectorized else find_closest_centroids
    )

    for _ in range(max_iters):
        idx = assign_fn(X, centroids)
        centroids = compute_centroids(X, idx, K)

    return centroids, idx


def kMeans_init_centroids(X: np.ndarray, K: int) -> np.ndarray:
    """
    Initializes K centroids for K-Means on dataset X by randomly selecting
    K distinct examples (Stanford assignment implementation).

    Args:
        X: Data points
        K: number of centroids/clusters

    Returns:
        centroids: Initialized centroids
    """
    randidx = np.random.permutation(X.shape[0])
    centroids = X[randidx[:K]]
    return centroids


# ---------------------------------------------------------------------------
# Compression helpers
# ---------------------------------------------------------------------------

def _rgb_to_hex(rgb: np.ndarray) -> str:
    r, g, b = [int(np.clip(round(c), 0, 255)) for c in rgb]
    return f"#{r:02X}{g:02X}{b:02X}"


def _image_to_base64_png(img_array: np.ndarray) -> str:
    """Encode an HxWx3 uint8 RGB array as a Base64 PNG data URL."""
    pil_img = Image.fromarray(img_array, mode="RGB")
    buffer = io.BytesIO()
    pil_img.save(buffer, format="PNG", optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def _resize_for_realtime(img: Image.Image, max_dim: int = 512) -> Image.Image:
    """Downscale large uploads so browser requests finish quickly."""
    w, h = img.size
    longest = max(w, h)
    if longest <= max_dim:
        return img
    scale = max_dim / float(longest)
    new_size = (max(1, int(w * scale)), max(1, int(h * scale)))
    return img.resize(new_size, Image.Resampling.LANCZOS)


def compute_compression_stats(height: int, width: int, K: int) -> dict[str, float | int]:
    """
    Theoretical compression statistics matching the course notes:
      uncompressed_bits = H * W * 24
      compressed_bits   = (K * 24) + (H * W * ceil(log2(K)))
    """
    bits_per_index = int(math.ceil(math.log2(max(K, 2))))
    original_bits = height * width * 24
    compressed_bits = (K * 24) + (height * width * bits_per_index)
    compression_ratio = original_bits / compressed_bits if compressed_bits > 0 else 0.0
    percent_saved = (1.0 - (compressed_bits / original_bits)) * 100.0 if original_bits > 0 else 0.0

    return {
        "original_bits": int(original_bits),
        "compressed_bits": int(compressed_bits),
        "compression_ratio": round(float(compression_ratio), 4),
        "percent_saved": round(float(percent_saved), 2),
        "bits_per_index": bits_per_index,
    }


def compress_image_pipeline(
    image_bytes: bytes,
    K: int = 16,
    max_iters: int = 10,
    max_dim: int = 512,
) -> dict[str, Any]:
    """
    Full image color-quantization pipeline using Stanford K-Means.

    1. Load with PIL, enforce RGB
    2. Resize large uploads
    3. Normalize to [0, 1] and reshape to (-1, 3)
    4. Initialize + run K-Means
    5. Map pixels to centroids and encode Base64 PNG
    6. Return palette + theoretical compression metrics
    """
    start = time.perf_counter()

    if K < 2:
        raise ValueError("K must be at least 2")
    if max_iters < 1:
        raise ValueError("max_iters must be at least 1")

    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    pil_img = _resize_for_realtime(pil_img, max_dim=max_dim)

    original_img = np.array(pil_img, dtype=np.float64)
    height, width = original_img.shape[0], original_img.shape[1]

    X_img = np.reshape(original_img / 255.0, (-1, 3))

    initial_centroids = kMeans_init_centroids(X_img, K)
    centroids, idx = run_kMeans(X_img, initial_centroids, max_iters, use_vectorized=True)

    # Final assignment (matches assignment compression section)
    idx = find_closest_centroids_vectorized(X_img, centroids)
    X_recovered = centroids[idx, :]
    X_recovered = np.reshape(X_recovered, original_img.shape)
    recovered_uint8 = np.clip(X_recovered * 255.0, 0, 255).astype(np.uint8)
    original_uint8 = np.clip(original_img, 0, 255).astype(np.uint8)

    original_b64 = _image_to_base64_png(original_uint8)
    compressed_b64 = _image_to_base64_png(recovered_uint8)

    centroid_rgb = np.clip(np.round(centroids * 255.0), 0, 255).astype(np.uint8)
    palette = [
        {"hex": _rgb_to_hex(rgb), "rgb": [int(rgb[0]), int(rgb[1]), int(rgb[2])]}
        for rgb in centroid_rgb
    ]

    stats = compute_compression_stats(height, width, K)
    elapsed_ms = (time.perf_counter() - start) * 1000.0

    return {
        "original_image": original_b64,
        "compressed_image": compressed_b64,
        "palette": palette,
        "metrics": {
            "original_bits": stats["original_bits"],
            "compressed_bits": stats["compressed_bits"],
            "compression_ratio": stats["compression_ratio"],
            "percent_saved": stats["percent_saved"],
            "processing_time_ms": round(elapsed_ms, 2),
            "height": height,
            "width": width,
            "K": K,
            "max_iters": max_iters,
            "bits_per_index": stats["bits_per_index"],
        },
    }

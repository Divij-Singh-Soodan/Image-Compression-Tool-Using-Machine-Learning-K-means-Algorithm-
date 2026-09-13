# ChromaCompress

Interactive image compression and color quantization powered by **unsupervised K-Means clustering** — implementing the exact algorithm from the Stanford / Coursera Unsupervised Learning assignment.

Reduce any photo to *K* representative colors, inspect the centroid palette, and compare before/after with a split slider. Theoretical bit-reduction metrics match the course notes:

$$
\begin{aligned}
\text{uncompressed} &= H \times W \times 24 \\
\text{compressed} &= (K \times 24) + (H \times W \times \lceil\log_2 K\rceil)
\end{aligned}
$$

## Project structure

```
ChromaCompress/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── ml_engine.py       # Stanford K-Means + compress pipeline
│   │   ├── schemas.py
│   │   └── main.py
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       └── components/
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+

## Setup & run

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
python run.py
```

API listens on **http://127.0.0.1:8000**  
Docs: http://127.0.0.1:8000/docs

### 2. Frontend (Vite + React)

Open a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

App opens at **http://localhost:5173**

### Run both simultaneously

**Terminal A — API**

```bash
cd backend
.\.venv\Scripts\Activate.ps1   # or: source .venv/bin/activate
python run.py
```

**Terminal B — UI**

```bash
cd frontend
npm run dev
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/compress` | Multipart form: `file`, `k` (2–64), `max_iters` (5–20) |

Response JSON includes Base64 PNG data URLs for original & compressed images, the centroid `palette`, and `metrics` (`original_bits`, `compressed_bits`, `compression_ratio`, `percent_saved`, `processing_time_ms`).

## ML engine (assignment parity)

| Function | Behavior |
|----------|----------|
| `kMeans_init_centroids` | `np.random.permutation` → first *K* examples |
| `find_closest_centroids` | Nested loop + `np.linalg.norm` / `np.argmin` (lab) |
| `find_closest_centroids_vectorized` | Broadcasted norms for realtime uploads |
| `compute_centroids` | Mean per cluster; empty clusters re-sampled |
| `run_kMeans` | Alternating assignment & update for `max_iters` |
| `compress_image_pipeline` | PIL RGB → resize → normalize → K-Means → Base64 PNG |

## License

Educational / portfolio use. Algorithm structure follows the Stanford Unsupervised Learning lab.

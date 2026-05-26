# ── Whisper FastAPI Service ───────────────────────────────────────────────────
FROM python:3.11-slim

# System deps + python3-setuptools (provides pkg_resources at OS level)
# This is critical: openai-whisper uses setup.py which needs pkg_resources
# even inside pip's isolated build environment
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ffmpeg \
      git \
      curl \
      python3-setuptools \
      python3-wheel \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip + ensure setuptools/wheel available via pip too
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy and install requirements
# --no-build-isolation: use system setuptools instead of pip's isolated env
# This prevents "No module named pkg_resources" for packages using setup.py
COPY requirements.txt .
RUN pip install --no-cache-dir --no-build-isolation -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=10 --start-period=90s \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

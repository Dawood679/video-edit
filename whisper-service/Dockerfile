# ── Whisper FastAPI Service ───────────────────────────────────────────────────
# Use full python:3.11 (NOT slim) — slim strips setuptools/pkg_resources which
# openai-whisper's setup.py needs. The full image ships setuptools pre-baked.
FROM python:3.11

# System deps: ffmpeg (audio decode), git (whisper fetches tiktoken via git),
#              curl (healthcheck probe)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ffmpeg \
      git \
      curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip only — setuptools/wheel already correct in full python:3.11 image
RUN pip install --no-cache-dir --upgrade pip

# Install requirements
# No --no-build-isolation needed; full image has pkg_resources available
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=10 --start-period=90s \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

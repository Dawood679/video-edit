# ── Whisper FastAPI Service ───────────────────────────────────────────────────
# Uses python:3.11-slim to keep the image lean.
# ffmpeg is required by Whisper for audio extraction from video containers.

FROM python:3.11-slim

# System dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ffmpeg \
      git \
      curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (cached layer unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

# Health check so docker-compose knows when the model is loaded
HEALTHCHECK --interval=30s --timeout=10s --retries=10 --start-period=90s \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

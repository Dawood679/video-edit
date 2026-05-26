"""
OnixFrame – Whisper Transcription Service
==========================================
FastAPI microservice that:
 1. Receives a MinIO storage key from the Next.js app
 2. Downloads the video to a temp file
 3. Runs OpenAI Whisper transcription
 4. Returns structured JSON (text, language, confidence, duration, segments)
"""

import os
import tempfile
import logging

import whisper
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from minio import Minio
from minio.error import S3Error

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("whisper-service")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="OnixFrame Whisper Service", version="1.0.0")

# ── Config ────────────────────────────────────────────────────────────────────
MODEL_SIZE   = os.getenv("MODEL_SIZE",     "base")   # tiny|base|small|medium|large
MINIO_HOST   = os.getenv("MINIO_ENDPOINT", "minio")
MINIO_PORT   = int(os.getenv("MINIO_PORT", "9000"))
MINIO_KEY    = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET = os.getenv("MINIO_SECRET_KEY", "minioadmin123")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "onixframe-videos")
MINIO_SSL    = os.getenv("MINIO_USE_SSL", "false").lower() == "true"

# ── Singletons (loaded on startup) ───────────────────────────────────────────
_whisper_model = None

minio_client = Minio(
    endpoint=f"{MINIO_HOST}:{MINIO_PORT}",
    access_key=MINIO_KEY,
    secret_key=MINIO_SECRET,
    secure=MINIO_SSL,
)


@app.on_event("startup")
async def load_model():
    global _whisper_model
    log.info(f"Loading Whisper model: {MODEL_SIZE} ...")
    _whisper_model = whisper.load_model(MODEL_SIZE)
    log.info("Whisper model loaded and ready.")


# ── Request / Response schemas ────────────────────────────────────────────────
class TranscribeRequest(BaseModel):
    storage_key: str
    language:    Optional[str] = None


class TranscribeResponse(BaseModel):
    text:       str
    language:   Optional[str]
    confidence: Optional[float]
    duration:   Optional[float]
    segments:   list


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    """Health check — also signals whether the model is loaded."""
    return {
        "status":       "ok",
        "model":        MODEL_SIZE,
        "model_loaded": _whisper_model is not None,
    }


@app.post("/transcribe", response_model=TranscribeResponse)
def transcribe(req: TranscribeRequest):
    """
    Download video from MinIO by storage_key, run Whisper, return transcript.
    """
    if _whisper_model is None:
        raise HTTPException(status_code=503, detail="Whisper model not yet loaded.")

    log.info(f"Transcribing: {req.storage_key}")

    # Download to a temp file (Whisper needs a file path, not a stream)
    suffix = os.path.splitext(req.storage_key)[-1] or ".mp4"
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(tmp_fd)

    try:
        # Fetch from MinIO
        try:
            minio_client.fget_object(MINIO_BUCKET, req.storage_key, tmp_path)
        except S3Error as e:
            log.error(f"MinIO download error: {e}")
            raise HTTPException(status_code=404, detail=f"File not found in storage: {req.storage_key}")

        # Transcribe
        options: dict = {}
        if req.language:
            options["language"] = req.language

        result = _whisper_model.transcribe(tmp_path, verbose=False, **options)

        # Compute average log-probability as a confidence proxy
        segs = result.get("segments", [])
        confidence = None
        if segs:
            log_probs = [s.get("avg_logprob", 0.0) for s in segs if "avg_logprob" in s]
            if log_probs:
                confidence = float(sum(log_probs) / len(log_probs))

        duration = segs[-1]["end"] if segs else None

        log.info(f"Transcription complete. Language={result.get('language')}, Duration={duration}s")

        return TranscribeResponse(
            text=result["text"].strip(),
            language=result.get("language"),
            confidence=confidence,
            duration=duration,
            segments=segs,
        )

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
            log.debug(f"Temp file removed: {tmp_path}")

# OnixFrame 🎬

> AI-powered video transcription, metadata generation, and enhancement — fully self-hosted.

**Stack:** Next.js 15 · Tailwind CSS v4 · Prisma v7 · NeonDB · MinIO · OpenAI Whisper · Llama 3.2:3b · FFmpeg · Docker

---

## Features

| Feature | Technology |
|---------|-----------|
| Accurate transcription | OpenAI Whisper (runs locally) |
| AI title, description, tags | Llama 3.2:3b via Ollama |
| SEO score (0–100) | Llama 3.2:3b via Ollama |
| Video enhancement | FFmpeg (brightness, contrast, sharpness, noise reduction) |
| Object storage | MinIO (S3-compatible, runs in Docker) |
| Database | NeonDB (PostgreSQL cloud) via Prisma |
| Dark / Light mode | next-themes |
| 10-minute video limit | Client + server validation |

---

## Quick Start (Local)

### Prerequisites
- Docker + Docker Compose v2
- Node.js 20+ (for local dev without Docker)
- Git

### 1. Clone & configure

```bash
git clone <your-repo-url> onixframe-app
cd onixframe-app

# Copy and edit environment variables
cp .env.example .env
# Edit .env — the defaults work for local Docker dev, no changes needed
```

### 2. Start all services

```bash
docker compose up -d
```

This starts:
- **Next.js app** → http://localhost:3000
- **MinIO console** → http://localhost:9001 (login: `minioadmin` / `minioadmin123`)
- **Whisper service** → http://localhost:8000/health (internal)
- **Ollama** → http://localhost:11434 (internal)
- **PostgreSQL** → localhost:5432

> **First boot takes ~5 minutes** — Whisper downloads the model and Ollama pulls llama3.2:3b.
> Subsequent boots take ~30s because models are cached in Docker volumes.

### 3. Open the app

```
http://localhost:3000
```

Click **Get Started** → Dashboard → upload a video → transcribe → generate metadata.

---

## EC2 Deployment

### 1. Provision EC2

- **Recommended:** `t3.large` (8 GB RAM, 2 vCPU) minimum
- **Better:** `t3.xlarge` (16 GB RAM) for Whisper `small` model
- **AMI:** Ubuntu 22.04 LTS
- **Security Group — inbound rules:**

| Port | Purpose | Source |
|------|---------|--------|
| 22   | SSH     | Your IP |
| 3000 | Next.js app | 0.0.0.0/0 |
| 9000 | MinIO API (video URLs) | 0.0.0.0/0 |
| 9001 | MinIO Console | Your IP |

### 2. Install Docker on EC2

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
newgrp docker   # or log out + back in
```

### 3. Clone & configure for EC2

```bash
git clone <your-repo-url> onixframe-app
cd onixframe-app
cp .env.example .env
nano .env
```

Edit `.env` with your EC2-specific values:

```bash
# Replace <EC2_PUBLIC_IP> with your actual EC2 public IP or Elastic IP
DATABASE_URL=postgresql://<neon-user>:<neon-pass>@ep-xxx.neon.tech/neondb?sslmode=require
MINIO_ACCESS_KEY=<strong-key>
MINIO_SECRET_KEY=<strong-secret-min-8-chars>
MINIO_PUBLIC_URL=http://<EC2_PUBLIC_IP>:9000
NEXT_PUBLIC_MINIO_URL=http://<EC2_PUBLIC_IP>:9000
NEXT_PUBLIC_APP_URL=http://<EC2_PUBLIC_IP>:3000
EC2_PUBLIC_IP=<EC2_PUBLIC_IP>
```

Also edit `docker-compose.yml` to **remove the `postgres` service** (and its `depends_on` in `app`) since you're using NeonDB.

### 4. Deploy

```bash
docker compose -f docker-compose.yml up -d

# Watch startup logs
docker compose logs -f app
# Wait for: "▲ Next.js ready on http://..."
```

### 5. Access

```
http://<EC2_PUBLIC_IP>:3000
```

---

## Local Development (without Docker)

```bash
# 1. Start only infrastructure services
docker compose up postgres minio minio-init whisper ollama ollama-init -d

# 2. Install dependencies
cd onixframe
npm install

# 3. Configure local env
# Edit .env.local — change MINIO_ENDPOINT/WHISPER_SERVICE_URL/OLLAMA_URL to localhost

# 4. Run DB migrations
npx prisma migrate dev

# 5. Start Next.js dev server
npm run dev
```

---

## Changing Whisper Model Size

Edit `.env`:
```
WHISPER_MODEL_SIZE=small   # tiny | base | small | medium | large
```

Then rebuild the Whisper service:
```bash
docker compose up whisper --build -d
```

Model sizes vs. accuracy:
| Model | RAM  | Speed | Accuracy |
|-------|------|-------|---------|
| tiny  | 1 GB | ⚡⚡⚡ | ★★☆    |
| base  | 1 GB | ⚡⚡  | ★★★    |
| small | 2 GB | ⚡    | ★★★★   |
| medium| 5 GB | 🐢    | ★★★★★  |

---

## Project Structure

```
.
├── docker-compose.yml          Main Docker Compose (production)
├── docker-compose.override.yml Dev overrides (auto-loaded)
├── .env.example                Template for environment variables
│
├── whisper-service/            Python FastAPI + Whisper
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
│
└── onixframe/                  Next.js 15 application
    ├── Dockerfile              Multi-stage production build
    ├── prisma/schema.prisma    Database schema
    ├── prisma.config.ts        Prisma v7 config + connection URL
    └── src/
        ├── app/                Next.js App Router pages + API routes
        ├── components/         React components
        ├── lib/                Server utilities (prisma, minio, whisper, ollama)
        └── hooks/              Client hooks (useVideoStatus polling)
```

---

## NeonDB Setup

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project → copy the **Pooler connection string**
3. Paste it as `DATABASE_URL` in your `.env` — must include `?sslmode=require`
4. Migrations run automatically on app startup (`prisma migrate deploy`)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Video URLs broken on EC2 | Set `MINIO_PUBLIC_URL=http://<EC2_IP>:9000` in `.env` |
| Ollama "model not found" | Wait for `ollama-init` to finish: `docker compose logs ollama-init` |
| Whisper times out | Video too long, or use a smaller model (`tiny`) |
| App crash on start | Check `DATABASE_URL` — NeonDB needs `?sslmode=require` |
| MinIO bucket missing | Run `docker compose up minio-init` manually |
| FFmpeg errors | Already bundled via `ffmpeg-static` npm package — no system install needed |

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToMinio, ensureBucket } from '@/lib/minio';
import { randomUUID } from 'crypto';
import path from 'path';

const MAX_DURATION_S  = parseInt(process.env.MAX_VIDEO_DURATION_SECONDS || '600');
const MAX_SIZE_BYTES  = parseInt(process.env.MAX_FILE_SIZE_BYTES || '524288000');
const ALLOWED_EXTS    = new Set(['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v']);
const ALLOWED_MIMES   = new Set([
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'video/x-matroska', 'video/webm', 'video/m4v', 'video/mpeg',
]);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file     = formData.get('video');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // ── Validate extension ────────────────────────────────────────────────
    const ext = path.extname(file.name || '').toLowerCase();
    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type "${ext}". Allowed: ${[...ALLOWED_EXTS].join(', ')}` },
        { status: 415 }
      );
    }

    // ── Validate size ─────────────────────────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      const mb = Math.round(MAX_SIZE_BYTES / 1024 / 1024);
      return NextResponse.json(
        { error: `File is too large. Maximum allowed size is ${mb} MB.` },
        { status: 413 }
      );
    }

    // ── Client sends duration header for extra server-side guard ──────────
    const durationHeader = request.headers.get('x-video-duration');
    if (durationHeader) {
      const clientDuration = parseFloat(durationHeader);
      if (!isNaN(clientDuration) && clientDuration > MAX_DURATION_S) {
        const mins = Math.ceil(clientDuration / 60);
        return NextResponse.json(
          { error: `Video is ${mins} minutes long. Maximum is ${MAX_DURATION_S / 60} minutes.` },
          { status: 422 }
        );
      }
    }

    // ── Read file buffer ──────────────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);

    // ── Upload to MinIO ───────────────────────────────────────────────────
    const uuid       = randomUUID();
    const storageKey = `videos/${uuid}${ext}`;
    const mimeType   = ALLOWED_MIMES.has(file.type) ? file.type : 'video/mp4';

    await ensureBucket();
    await uploadToMinio(buffer, storageKey, mimeType, buffer.length);

    // ── Create DB record ──────────────────────────────────────────────────
    const video = await prisma.video.create({
      data: {
        filename:     `${uuid}${ext}`,
        originalName: file.name || `video${ext}`,
        size:         file.size,
        mimeType,
        storageKey,
        status:       'PENDING',
      },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/videos/upload]', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}

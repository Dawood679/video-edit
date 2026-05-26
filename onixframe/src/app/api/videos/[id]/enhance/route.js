import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getObjectStream, uploadToMinio } from '@/lib/minio';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { PassThrough } from 'stream';
import path from 'path';

// EC2 / Alpine fix: use bundled ffmpeg-static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

// POST /api/videos/[id]/enhance
export async function POST(request, { params }) {
  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const {
      brightness  = 0,      // -1.0 to 1.0
      contrast    = 1,      // 0.5 to 2.0
      sharpness   = 0,      // 0 to 2.0
      noiseReduce = false,
    } = body;

    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    const job = await prisma.processingJob.create({
      data: {
        videoId:   id,
        type:      'ENHANCEMENT',
        status:    'RUNNING',
        progress:  0,
        startedAt: new Date(),
      },
    });

    // Fire-and-forget
    runEnhancement(video, job.id, { brightness, contrast, sharpness, noiseReduce }).catch((err) =>
      console.error(`[enhance bg] job ${job.id}:`, err)
    );

    return NextResponse.json({ jobId: job.id, status: 'RUNNING' });
  } catch (err) {
    console.error('[POST /api/videos/[id]/enhance]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function runEnhancement(video, jobId, opts) {
  try {
    // Stream video from MinIO
    const inputStream  = await getObjectStream(video.storageKey);
    const outputStream = new PassThrough();

    // Build FFmpeg video filter chain
    const filters = [];

    if (opts.brightness !== 0 || opts.contrast !== 1) {
      filters.push(`eq=brightness=${opts.brightness.toFixed(2)}:contrast=${opts.contrast.toFixed(2)}`);
    }
    if (opts.sharpness > 0) {
      filters.push(`unsharp=5:5:${opts.sharpness.toFixed(1)}:5:5:0`);
    }
    if (opts.noiseReduce) {
      filters.push('hqdn3d=4:4:3:3');
    }

    const ext         = path.extname(video.filename) || '.mp4';
    const enhancedKey = video.storageKey.replace('videos/', 'enhanced/');

    // Collect output chunks in memory (safe for ≤10-min videos)
    const chunks = [];
    outputStream.on('data', (chunk) => chunks.push(chunk));

    await new Promise((resolve, reject) => {
      const cmd = ffmpeg(inputStream)
        .inputFormat(ext.slice(1))
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .outputOptions([
          '-movflags', 'frag_keyframe+empty_moov', // enables streaming MP4
          '-preset', 'fast',
          '-crf', '22',
        ]);

      if (filters.length > 0) {
        cmd.videoFilters(filters);
      }

      cmd.on('error', reject);
      cmd.pipe(outputStream, { end: true });
      outputStream.on('finish', resolve);
      outputStream.on('error', reject);
    });

    const outputBuffer = Buffer.concat(chunks);

    await uploadToMinio(outputBuffer, enhancedKey, video.mimeType, outputBuffer.length);

    // Point video to the enhanced version
    await prisma.video.update({
      where: { id: video.id },
      data:  { storageKey: enhancedKey, status: 'ENHANCED' },
    });

    await prisma.processingJob.update({
      where: { id: jobId },
      data:  { status: 'COMPLETED', progress: 100, completedAt: new Date() },
    });
  } catch (err) {
    console.error('[runEnhancement]', err);
    await prisma.processingJob
      .update({
        where: { id: jobId },
        data:  { status: 'FAILED', error: err.message, completedAt: new Date() },
      })
      .catch(() => {});
  }
}

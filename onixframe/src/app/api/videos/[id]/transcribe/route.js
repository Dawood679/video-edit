import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transcribeVideo } from '@/lib/whisper';

// POST /api/videos/[id]/transcribe
export async function POST(_request, { params }) {
  const { id } = await params;

  try {
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    if (video.status === 'PROCESSING') {
      return NextResponse.json({ error: 'Already processing' }, { status: 409 });
    }

    // Create a job record
    const job = await prisma.processingJob.create({
      data: {
        videoId:   id,
        type:      'TRANSCRIPTION',
        status:    'RUNNING',
        progress:  0,
        startedAt: new Date(),
      },
    });

    // Mark video as processing
    await prisma.video.update({ where: { id }, data: { status: 'PROCESSING' } });

    // Fire-and-forget — API returns immediately; client polls /status
    runTranscription(video, job.id).catch((err) =>
      console.error(`[transcribe bg] job ${job.id}:`, err)
    );

    return NextResponse.json({ jobId: job.id, status: 'RUNNING' });
  } catch (err) {
    console.error('[POST /api/videos/[id]/transcribe]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function runTranscription(video, jobId) {
  try {
    const result = await transcribeVideo(video.storageKey);

    await prisma.transcription.upsert({
      where:  { videoId: video.id },
      update: {
        text:       result.text,
        language:   result.language,
        confidence: result.confidence,
        duration:   result.duration,
        segments:   result.segments,
      },
      create: {
        videoId:    video.id,
        text:       result.text,
        language:   result.language,
        confidence: result.confidence,
        duration:   result.duration,
        segments:   result.segments,
      },
    });

    await prisma.video.update({
      where: { id: video.id },
      data:  {
        status:   'TRANSCRIBED',
        duration: result.duration ?? video.duration,
      },
    });

    await prisma.processingJob.update({
      where: { id: jobId },
      data:  { status: 'COMPLETED', progress: 100, completedAt: new Date() },
    });
  } catch (err) {
    console.error('[runTranscription]', err);
    await prisma.processingJob
      .update({
        where: { id: jobId },
        data:  { status: 'FAILED', error: err.message, completedAt: new Date() },
      })
      .catch(() => {});

    await prisma.video
      .update({ where: { id: video.id }, data: { status: 'FAILED' } })
      .catch(() => {});
  }
}

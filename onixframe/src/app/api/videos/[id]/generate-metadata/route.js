import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMetadata } from '@/lib/ollama';

// POST /api/videos/[id]/generate-metadata
export async function POST(_request, { params }) {
  const { id } = await params;

  try {
    const video = await prisma.video.findUnique({
      where:   { id },
      include: { transcription: true },
    });

    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    if (!video.transcription) {
      return NextResponse.json(
        { error: 'No transcription found. Run transcription first.' },
        { status: 400 }
      );
    }

    const job = await prisma.processingJob.create({
      data: {
        videoId:   id,
        type:      'METADATA_GENERATION',
        status:    'RUNNING',
        progress:  0,
        startedAt: new Date(),
      },
    });

    // Fire-and-forget
    runMetadataGeneration(video, job.id).catch((err) =>
      console.error(`[metadata bg] job ${job.id}:`, err)
    );

    return NextResponse.json({ jobId: job.id, status: 'RUNNING' });
  } catch (err) {
    console.error('[POST /api/videos/[id]/generate-metadata]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function runMetadataGeneration(video, jobId) {
  try {
    const metadata = await generateMetadata(
      video.transcription.text,
      video.duration
    );

    await prisma.videoMetadata.upsert({
      where:  { videoId: video.id },
      update: metadata,
      create: { videoId: video.id, ...metadata },
    });

    await prisma.video.update({
      where: { id: video.id },
      data:  { status: 'METADATA_GENERATED' },
    });

    await prisma.processingJob.update({
      where: { id: jobId },
      data:  { status: 'COMPLETED', progress: 100, completedAt: new Date() },
    });
  } catch (err) {
    console.error('[runMetadataGeneration]', err);
    await prisma.processingJob
      .update({
        where: { id: jobId },
        data:  { status: 'FAILED', error: err.message, completedAt: new Date() },
      })
      .catch(() => {});
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPresignedUrl, deleteObject } from '@/lib/minio';

// GET /api/videos/[id]
export async function GET(_request, { params }) {
  const { id } = await params;
  try {
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        transcription:  true,
        metadata:       true,
        processingJobs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const url = await getPresignedUrl(video.storageKey).catch(() => null);

    return NextResponse.json({ video: { ...video, url } });
  } catch (err) {
    console.error('[GET /api/videos/[id]]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/videos/[id]
export async function DELETE(_request, { params }) {
  const { id } = await params;
  try {
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Remove from MinIO (best-effort, don't fail if already gone)
    await deleteObject(video.storageKey).catch(() => {});

    // Cascade deletes transcription, metadata, processingJobs
    await prisma.video.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/videos/[id]]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

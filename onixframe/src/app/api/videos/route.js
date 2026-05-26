import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPresignedUrl } from '@/lib/minio';

// GET /api/videos — list all videos with latest processing job
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '12'));
    const skip  = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          metadata:       true,
          transcription:  { select: { id: true, language: true, duration: true } },
          processingJobs: {
            orderBy: { createdAt: 'desc' },
            take:    1,
          },
        },
      }),
      prisma.video.count(),
    ]);

    // Attach presigned URLs for the client
    const videosWithUrls = await Promise.all(
      videos.map(async (v) => ({
        ...v,
        url: await getPresignedUrl(v.storageKey).catch(() => null),
      }))
    );

    return NextResponse.json({
      videos: videosWithUrls,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[GET /api/videos]', err);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

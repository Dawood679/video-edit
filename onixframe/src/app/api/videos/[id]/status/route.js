import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/videos/[id]/status  — lightweight polling endpoint
export async function GET(_request, { params }) {
  const { id } = await params;
  try {
    const video = await prisma.video.findUnique({
      where:   { id },
      select:  {
        status: true,
        processingJobs: {
          orderBy: { createdAt: 'desc' },
          take:    5,
        },
      },
    });

    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      status:         video.status,
      processingJobs: video.processingJobs,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

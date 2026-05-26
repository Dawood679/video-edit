'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import ProcessingProgress from '@/components/video/ProcessingProgress';
import TranscriptViewer   from '@/components/video/TranscriptViewer';
import MetadataCard       from '@/components/video/MetadataCard';
import EnhancementPanel   from '@/components/video/EnhancementPanel';
import { useVideoStatus } from '@/hooks/useVideoStatus';
import {
  ArrowLeft, Mic, Sparkles, Loader2,
  Film, HardDrive, Clock, Trash2
} from 'lucide-react';

function formatBytes(b) {
  if (!b) return '—';
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function formatDuration(s) {
  if (!s) return null;
  return `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`;
}

const CAN_TRANSCRIBE    = new Set(['PENDING', 'FAILED', 'TRANSCRIBED', 'METADATA_GENERATED', 'ENHANCED', 'COMPLETE']);
const CAN_GEN_METADATA  = new Set(['TRANSCRIBED', 'METADATA_GENERATED', 'ENHANCED', 'COMPLETE']);

export default function VideoDetailPage() {
  const { id }    = useParams();
  const router    = useRouter();

  const [video,   setVideo]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState(false); // transcribe / metadata button loading

  const { status, processingJobs, refetch } = useVideoStatus(id);

  const fetchVideo = useCallback(async () => {
    try {
      const res  = await fetch(`/api/videos/${id}`);
      if (!res.ok) { router.push('/dashboard'); return; }
      const data = await res.json();
      setVideo(data.video);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  // Initial load
  useEffect(() => { fetchVideo(); }, [fetchVideo]);

  // Re-fetch full video data whenever status changes (transcript/metadata may have appeared)
  useEffect(() => {
    if (status) fetchVideo();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ────────────────────────────────────────────────────────────────
  const triggerTranscription = async () => {
    setBusy(true);
    try {
      const res  = await fetch(`/api/videos/${id}/transcribe`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Transcription started — this may take a minute!');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const triggerMetadata = async () => {
    setBusy(true);
    try {
      const res  = await fetch(`/api/videos/${id}/generate-metadata`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Metadata generation started!');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this video and all its data? This cannot be undone.')) return;
    const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Video deleted');
      router.push('/dashboard');
    } else {
      toast.error('Delete failed');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      </div>
    );
  }

  if (!video) return null;

  const isProcessing = status === 'PROCESSING' || processingJobs.some((j) => j.status === 'RUNNING');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">

        {/* Back link */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-500 transition-colors mb-6">
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>

        {/* Video header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              {video.metadata?.title || video.originalName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-400">
              <span className="flex items-center gap-1"><HardDrive size={13} />{formatBytes(video.size)}</span>
              {video.duration && <span className="flex items-center gap-1"><Clock size={13} />{formatDuration(video.duration)}</span>}
              <span className="flex items-center gap-1"><Film size={13} />{video.mimeType}</span>
            </div>
          </div>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>

        {/* Processing jobs */}
        <ProcessingProgress jobs={processingJobs} />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={triggerTranscription}
            disabled={busy || isProcessing || !CAN_TRANSCRIBE.has(video.status)}
            className="btn-primary flex items-center gap-2"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            <Mic size={16} />
            Transcribe with Whisper
          </button>

          <button
            onClick={triggerMetadata}
            disabled={busy || isProcessing || !CAN_GEN_METADATA.has(video.status)}
            className="btn-soft flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            <Sparkles size={16} />
            Generate AI Metadata
          </button>
        </div>

        {/* Main content — two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Inline video player (via presigned URL) */}
            {video.url && (
              <div className="soft-card overflow-hidden">
                <video
                  key={video.url} // re-mount when enhanced URL changes
                  controls
                  className="w-full aspect-video bg-black rounded-2xl"
                  src={video.url}
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <TranscriptViewer transcription={video.transcription} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <MetadataCard metadata={video.metadata} videoId={id} />
            <EnhancementPanel videoId={id} onEnhanced={refetch} />
          </div>
        </div>
      </main>
    </div>
  );
}

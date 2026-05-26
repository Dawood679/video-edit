'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Film, Clock, CheckCircle2, AlertCircle,
  Loader2, FileText, Tag, ChevronRight
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:            { label: 'Pending',            color: 'text-slate-500',    bg: 'bg-slate-100 dark:bg-slate-800',           icon: Clock       },
  PROCESSING:         { label: 'Processing…',        color: 'text-blue-500',     bg: 'bg-blue-50 dark:bg-blue-900/30',           icon: Loader2     },
  TRANSCRIBED:        { label: 'Transcribed',        color: 'text-brand-600',    bg: 'bg-brand-50 dark:bg-brand-900/30',         icon: FileText    },
  METADATA_GENERATED: { label: 'Metadata Ready',     color: 'text-purple-600',   bg: 'bg-purple-50 dark:bg-purple-900/30',       icon: Tag         },
  ENHANCED:           { label: 'Enhanced',           color: 'text-emerald-600',  bg: 'bg-emerald-50 dark:bg-emerald-900/30',     icon: CheckCircle2 },
  COMPLETE:           { label: 'Complete',           color: 'text-emerald-600',  bg: 'bg-emerald-50 dark:bg-emerald-900/30',     icon: CheckCircle2 },
  FAILED:             { label: 'Failed',             color: 'text-red-500',      bg: 'bg-red-50 dark:bg-red-900/30',             icon: AlertCircle },
};

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDuration(seconds) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoCard({ video }) {
  const cfg = STATUS_CONFIG[video.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const isProcessing = video.status === 'PROCESSING';

  return (
    <Link href={`/dashboard/video/${video.id}`} className="block group">
      <div className="soft-card p-5 hover:shadow-soft-lg dark:hover:shadow-soft-dark transition-all duration-300 group-hover:-translate-y-1">

        {/* Video thumbnail placeholder */}
        <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-4 overflow-hidden relative">
          <Film size={32} className="text-slate-300 dark:text-slate-600" />
          {/* Status badge overlay */}
          <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
            <StatusIcon size={12} className={isProcessing ? 'animate-spin' : ''} />
            {cfg.label}
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {/* Use AI-generated title if available, else original filename */}
              {video.metadata?.title || video.originalName}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>{formatBytes(video.size)}</span>
              {video.duration && (
                <>
                  <span>·</span>
                  <span>{formatDuration(video.duration)}</span>
                </>
              )}
              <span>·</span>
              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-brand-400 transition-colors mt-0.5" />
        </div>

        {/* SEO score pill if available */}
        {video.metadata?.seoScore != null && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">SEO</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${video.metadata.seoScore >= 80 ? 'bg-emerald-500' : video.metadata.seoScore >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                style={{ width: `${video.metadata.seoScore}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${video.metadata.seoScore >= 80 ? 'text-emerald-500' : video.metadata.seoScore >= 50 ? 'text-amber-500' : 'text-red-400'}`}>
              {video.metadata.seoScore}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

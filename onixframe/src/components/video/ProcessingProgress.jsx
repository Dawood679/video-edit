'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

const JOB_LABELS = {
  TRANSCRIPTION:      'Whisper Transcription',
  METADATA_GENERATION:'AI Metadata Generation',
  ENHANCEMENT:        'Video Enhancement',
};

const STATUS_STYLES = {
  QUEUED:    { color: 'text-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800',         icon: Clock,        animate: false },
  RUNNING:   { color: 'text-brand-600',   bg: 'bg-brand-50 dark:bg-brand-900/30',       icon: Loader2,      animate: true  },
  COMPLETED: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20',   icon: CheckCircle2, animate: false },
  FAILED:    { color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20',           icon: XCircle,      animate: false },
};

export default function ProcessingProgress({ jobs }) {
  if (!jobs || jobs.length === 0) return null;

  const activeJobs = jobs.filter((j) => j.status === 'RUNNING' || j.status === 'QUEUED');
  const recentJobs = jobs.slice(0, 4);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="soft-card p-5 mb-6"
      >
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">
          Processing Status
        </h3>

        <div className="space-y-3">
          {recentJobs.map((job) => {
            const cfg  = STATUS_STYLES[job.status] || STATUS_STYLES.QUEUED;
            const Icon = cfg.icon;

            return (
              <div key={job.id} className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg}`}>
                {/* Icon */}
                <Icon
                  size={18}
                  className={`${cfg.color} shrink-0 ${cfg.animate ? 'animate-spin' : ''}`}
                />

                {/* Label + error */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${cfg.color}`}>
                    {JOB_LABELS[job.type] || job.type}
                  </p>
                  {job.error && (
                    <p className="text-xs text-red-400 truncate mt-0.5">{job.error}</p>
                  )}
                </div>

                {/* Progress bar for RUNNING jobs */}
                {job.status === 'RUNNING' && (
                  <div className="w-24 h-1.5 bg-brand-100 dark:bg-brand-900/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-500 rounded-full"
                      initial={{ width: '5%' }}
                      animate={{ width: `${Math.max(5, job.progress || 5)}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}

                {/* Status badge */}
                <span className={`text-xs font-semibold ${cfg.color} whitespace-nowrap`}>
                  {job.status === 'RUNNING'   && 'Running…'}
                  {job.status === 'QUEUED'    && 'Queued'}
                  {job.status === 'COMPLETED' && 'Done'}
                  {job.status === 'FAILED'    && 'Failed'}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

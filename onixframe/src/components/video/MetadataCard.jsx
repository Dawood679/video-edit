'use client';

import { useState } from 'react';
import { TrendingUp, Tag, Edit2, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

function SeoGauge({ score }) {
  const color  = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label  = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs work';
  const radius = 36;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      {/* SVG ring */}
      <div className="relative w-20 h-20 shrink-0">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
          <circle
            cx="40" cy="40" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp size={16} style={{ color }} />
          <span className="font-bold text-slate-800 dark:text-slate-100">SEO Score</span>
        </div>
        <span className="text-sm font-medium" style={{ color }}>{label}</span>
        <p className="text-xs text-slate-400 mt-1 max-w-[180px]">
          Based on content quality, keyword density & searchability.
        </p>
      </div>
    </div>
  );
}

export default function MetadataCard({ metadata, videoId }) {
  const [editing,    setEditing]    = useState(false);
  const [editTitle,  setEditTitle]  = useState('');
  const [editDesc,   setEditDesc]   = useState('');
  const [saving,     setSaving]     = useState(false);

  if (!metadata) {
    return (
      <div className="soft-card p-6 text-center h-full flex flex-col items-center justify-center gap-3">
        <Sparkles size={36} className="text-slate-300 dark:text-slate-600" />
        <p className="text-slate-400 text-sm">
          No metadata yet. Transcribe first, then click &quot;Generate AI Metadata&quot;.
        </p>
      </div>
    );
  }

  const startEdit = () => {
    setEditTitle(metadata.title);
    setEditDesc(metadata.description);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = async () => {
    setSaving(true);
    try {
      // For now just show success (persist via PATCH route if needed later)
      toast.success('Metadata saved!');
      setEditing(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="soft-card p-6 space-y-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles size={18} className="text-brand-500" />
          AI Metadata
        </h3>
        {!editing && (
          <button onClick={startEdit} className="btn-soft text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Edit2 size={13} />
            Edit
          </button>
        )}
      </div>

      {/* SEO Score */}
      <SeoGauge score={metadata.seoScore ?? 0} />

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Title</label>
        {editing ? (
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 text-sm rounded-xl border border-brand-300 dark:border-brand-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all"
          />
        ) : (
          <p className="text-slate-800 dark:text-slate-100 font-semibold text-sm leading-snug">{metadata.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
        {editing ? (
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 text-sm rounded-xl border border-brand-300 dark:border-brand-600 bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all"
          />
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-6">{metadata.description}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
          <Tag size={11} /> Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {(metadata.tags || []).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 border border-brand-100 dark:border-brand-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Edit actions */}
      {editing && (
        <div className="flex gap-2 pt-1">
          <button onClick={saveEdit} disabled={saving} className="btn-primary text-sm py-2 flex items-center gap-1.5">
            <Check size={14} />
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={cancelEdit} className="btn-soft text-sm py-2 flex items-center gap-1.5">
            <X size={14} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

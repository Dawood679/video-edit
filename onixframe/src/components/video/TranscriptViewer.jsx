'use client';

import { useState, useMemo } from 'react';
import { Copy, Check, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-700/50 rounded px-0.5 text-slate-800 dark:text-slate-100">$1</mark>');
}

export default function TranscriptViewer({ transcription }) {
  const [copied,  setCopied]  = useState(false);
  const [search,  setSearch]  = useState('');

  if (!transcription) {
    return (
      <div className="soft-card p-6 text-center">
        <FileText size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-slate-400 text-sm">No transcript yet. Click &quot;Transcribe with Whisper&quot; to generate one.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription.text);
    setCopied(true);
    toast.success('Transcript copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = useMemo(
    () => highlightText(transcription.text, search),
    [transcription.text, search]
  );

  // Convert Whisper confidence (avg log-prob) to human-readable %
  const confidencePct = transcription.confidence != null
    ? `${Math.round(Math.exp(transcription.confidence) * 100)}%`
    : '—';

  return (
    <div className="soft-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText size={18} className="text-brand-500" />
            Transcript
          </h3>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
            {transcription.language && (
              <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full font-medium">
                {transcription.language.toUpperCase()}
              </span>
            )}
            {transcription.duration && (
              <span>{(transcription.duration / 60).toFixed(1)} min</span>
            )}
            <span>Confidence: {confidencePct}</span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="btn-soft text-xs py-1.5 px-3 shrink-0 flex items-center gap-1.5"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transcript…"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all"
        />
      </div>

      {/* Transcript content */}
      <div
        className="max-h-72 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl prose-sm prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}

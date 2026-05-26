'use client';

import { useState } from 'react';
import { Sliders, Zap, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_OPTS = {
  brightness:  0,
  contrast:    1,
  sharpness:   0,
  noiseReduce: false,
};

function Slider({ label, value, min, max, step, unit = '', onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        <span className="text-xs font-mono text-slate-400 tabular-nums">
          {value >= 0 ? '+' : ''}{value.toFixed(step < 0.1 ? 2 : 1)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          accentColor: '#6366f1',
          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((value - min) / (max - min)) * 100}%, #e2e8f0 ${((value - min) / (max - min)) * 100}%, #e2e8f0 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-slate-300 dark:text-slate-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${checked ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? 'left-7' : 'left-1'}`}
        />
      </button>
    </div>
  );
}

export default function EnhancementPanel({ videoId, onEnhanced }) {
  const [opts,    setOpts]    = useState(DEFAULT_OPTS);
  const [loading, setLoading] = useState(false);

  const update = (key) => (val) => setOpts((o) => ({ ...o, [key]: val }));

  const reset = () => setOpts(DEFAULT_OPTS);

  const hasChanges = opts.brightness !== 0 || opts.contrast !== 1 || opts.sharpness !== 0 || opts.noiseReduce;

  const apply = async () => {
    if (!hasChanges) {
      toast.info('Adjust at least one setting before applying.');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`/api/videos/${videoId}/enhance`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(opts),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Enhancement failed');
      toast.success('Enhancement started! Processing in background…');
      onEnhanced?.(data.jobId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soft-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sliders size={18} className="text-brand-500" />
          Video Enhancement
        </h3>
        {hasChanges && (
          <button onClick={reset} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors">
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      <div className="space-y-5">
        <Slider label="Brightness" value={opts.brightness} min={-1} max={1} step={0.05} onChange={update('brightness')} />
        <Slider label="Contrast"   value={opts.contrast}   min={0.5} max={2} step={0.05} onChange={update('contrast')} />
        <Slider label="Sharpness"  value={opts.sharpness}  min={0}   max={2} step={0.1}  onChange={update('sharpness')} />

        <Toggle
          label="Noise Reduction"
          description="hqdn3d filter — reduces grain and compression artifacts"
          checked={opts.noiseReduce}
          onChange={update('noiseReduce')}
        />
      </div>

      <button
        onClick={apply}
        disabled={loading || !hasChanges}
        className="btn-primary w-full mt-6 justify-center"
      >
        <Zap size={16} />
        {loading ? 'Starting…' : 'Apply Enhancement'}
      </button>

      <p className="text-xs text-slate-400 text-center mt-3">
        Processed by FFmpeg server-side. Original is preserved.
      </p>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Mic, Brain, Tag } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 28 },
  animate:   { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">

      {/* Animated gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%)',
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30" />

      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-300/20 dark:bg-brand-700/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-300/20 dark:bg-purple-900/15 rounded-full blur-3xl animate-pulse-slow [animation-delay:2s] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-100/20 dark:bg-brand-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-6 py-24 text-center">

        {/* Badge */}
        <motion.div {...fadeUp(0)} className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-700/60 shadow-sm">
            <Sparkles size={14} className="text-brand-500" />
            Whisper AI + Llama 3.2 · Runs locally · 100% private
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.1)} className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
          <span className="gradient-text" style={{ backgroundSize: '200% auto', animation: 'gradient 8s ease infinite' }}>
            Transcribe. Describe.
          </span>
          <br />
          <span className="text-slate-800 dark:text-slate-100">Dominate Search.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p {...fadeUp(0.2)} className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your video and get an accurate transcript, AI-generated title, description,
          and SEO tags — all running privately on your own server. No cloud AI needed.
        </motion.p>

        {/* CTA buttons */}
        <motion.div {...fadeUp(0.3)} className="flex items-center justify-center gap-4 flex-wrap mb-20">
          <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5 gap-2">
            Start for Free
            <ArrowRight size={18} />
          </Link>
          <a href="#how-it-works" className="btn-soft text-base px-8 py-3.5 gap-2">
            <Play size={16} />
            How it works
          </a>
        </motion.div>

        {/* Floating feature chips */}
        <motion.div
          {...fadeUp(0.45)}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {[
            { icon: Mic,   label: 'Auto Transcription' },
            { icon: Brain, label: 'AI Metadata'         },
            { icon: Tag,   label: 'SEO Tags & Score'    },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 soft-card text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              <Icon size={15} className="text-brand-500" />
              {label}
            </div>
          ))}
        </motion.div>

        {/* Floating app UI mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="animate-float max-w-4xl mx-auto"
        >
          <div className="soft-card overflow-hidden">
            {/* Mock browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-xs flex items-center px-3 text-slate-400 font-mono">
                onixframe.ai/dashboard
              </div>
            </div>

            {/* Mock dashboard content */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {['Transcription', 'AI Metadata', 'SEO Score'].map((label, i) => (
                  <div key={label} className="soft-card p-4 text-center">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 mx-auto mb-2 flex items-center justify-center">
                      <div className="w-4 h-4 rounded bg-brand-400/60" />
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
                    <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
                        style={{ width: `${[85, 92, 78][i]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock transcript block */}
              <div className="soft-card p-4">
                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
                <div className="space-y-2">
                  {[95, 80, 70, 60].map((w, i) => (
                    <div key={i} className="h-2 rounded bg-slate-100 dark:bg-slate-800" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

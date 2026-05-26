'use client';

import { motion } from 'framer-motion';
import { Upload, Cpu, Sparkles } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon:   Upload,
    title:  'Upload Your Video',
    desc:   'Drag and drop any MP4, MOV, MKV, or WebM file (up to 10 minutes). Your file is securely stored in MinIO — never sent to any external service.',
    color:  'text-brand-500',
    bg:     'bg-brand-50 dark:bg-brand-900/30',
    border: 'border-brand-200 dark:border-brand-700',
  },
  {
    number: '02',
    icon:   Cpu,
    title:  'AI Transcription',
    desc:   'Click Transcribe and Whisper gets to work. The model runs entirely on your server — no API keys, no data leaving your infrastructure. Get word-accurate transcripts in minutes.',
    color:  'text-purple-500',
    bg:     'bg-purple-50 dark:bg-purple-900/30',
    border: 'border-purple-200 dark:border-purple-700',
  },
  {
    number: '03',
    icon:   Sparkles,
    title:  'Generate SEO Metadata',
    desc:   'Llama 3.2 reads the transcript and generates a click-worthy title, engaging description, relevant tags, and an SEO score — all optimised for maximum reach.',
    color:  'text-emerald-500',
    bg:     'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-700',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-900/50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mb-4"
          >
            How it <span className="gradient-text">works</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 text-lg max-w-lg mx-auto"
          >
            Three simple steps from raw video to SEO-ready content.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-brand-200 via-purple-200 to-emerald-200 dark:from-brand-800 dark:via-purple-800 dark:to-emerald-800" />

          {steps.map(({ number, icon: Icon, title, desc, color, bg, border }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.15 }}
              className="flex flex-col items-center text-center"
            >
              {/* Step circle */}
              <div className={`relative w-16 h-16 rounded-2xl ${bg} border ${border} flex items-center justify-center mb-6 shadow-sm z-10`}>
                <Icon size={24} className={color} />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-sm">
                  {i + 1}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

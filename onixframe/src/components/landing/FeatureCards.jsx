'use client';

import { motion } from 'framer-motion';
import { Mic2, Brain, TrendingUp, Sliders, Lock, Zap } from 'lucide-react';

const features = [
  {
    icon:        Mic2,
    title:       'Accurate Transcription',
    description: 'OpenAI Whisper runs locally on your server — handles accents, technical jargon, and multiple languages with state-of-the-art accuracy.',
    gradient:    'from-blue-500 to-cyan-500',
    bg:          'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon:        Brain,
    title:       'AI-Generated Metadata',
    description: 'Llama 3.2 analyzes your transcript and crafts a compelling title, informative description, and relevant tags — all tailored to your content.',
    gradient:    'from-brand-500 to-purple-500',
    bg:          'bg-brand-50 dark:bg-brand-900/20',
  },
  {
    icon:        TrendingUp,
    title:       'SEO Score & Insights',
    description: 'Get a 0-100 SEO score with actionable insights. Optimize your content to rank higher and reach more viewers on any platform.',
    gradient:    'from-green-500 to-emerald-500',
    bg:          'bg-green-50 dark:bg-green-900/20',
  },
  {
    icon:        Sliders,
    title:       'Video Enhancement',
    description: 'Fine-tune brightness, contrast, and sharpness with FFmpeg filters. Reduce noise and improve visual quality — all processed server-side.',
    gradient:    'from-orange-500 to-amber-500',
    bg:          'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon:        Lock,
    title:       '100% Private & Local',
    description: 'Everything runs inside Docker on your own server. Your videos and transcripts never leave your infrastructure — complete data privacy.',
    gradient:    'from-rose-500 to-pink-500',
    bg:          'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon:        Zap,
    title:       'Fast & Scalable',
    description: 'MinIO provides S3-compatible object storage. NeonDB handles your data at scale. Built on Next.js 15 for lightning-fast performance.',
    gradient:    'from-violet-500 to-purple-500',
    bg:          'bg-violet-50 dark:bg-violet-900/20',
  },
];

export default function FeatureCards() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mb-4"
          >
            Everything you need,{' '}
            <span className="gradient-text">nothing you don&apos;t</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto"
          >
            A complete AI video pipeline — from raw footage to fully optimised, SEO-ready content.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, gradient, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="soft-card p-6 group cursor-default"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`w-6 h-6 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
                  <Icon size={14} className="text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Text */}
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

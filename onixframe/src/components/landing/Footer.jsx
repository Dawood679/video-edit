import Link from 'next/link';
import { Zap, GitBranch, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Zap size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-100">OnixFrame</span>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                AI-powered video transcription &amp; SEO
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/dashboard" className="hover:text-brand-500 transition-colors">
              Dashboard
            </Link>
            <a href="#how-it-works" className="hover:text-brand-500 transition-colors">
              How it works
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-brand-500 transition-colors"
            >
              <GitBranch size={16} />
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} OnixFrame. Built with Next.js · Whisper · Llama 3.2 · MinIO · NeonDB.
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Zap, Sun, Moon, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Prevent SSR/CSR hydration mismatch on theme toggle
  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-sm border-b border-slate-200/60 dark:border-slate-700/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300">
            <Zap size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight gradient-text">OnixFrame</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Theme toggle — only after mount to avoid hydration mismatch */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl soft-card hover:scale-105 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark'
                ? <Sun size={18} className="text-amber-400" />
                : <Moon size={18} className="text-slate-600" />
              }
            </button>
          )}

          {/* Dashboard link */}
          <Link href="/dashboard" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          {/* Sign In / Get Started — redirects to dashboard (no auth yet) */}
          <Link href="/dashboard" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

'use client';

import { Geist } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>OnixFrame – AI Video Transcription</title>
        <meta
          name="description"
          content="Transform videos into transcripts, SEO metadata, and more with AI. Private, local, and fast."
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geist.variable} font-sans min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}

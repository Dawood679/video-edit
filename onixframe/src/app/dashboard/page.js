'use client';

import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import VideoUploadDropzone from '@/components/dashboard/VideoUploadDropzone';
import VideoCard from '@/components/dashboard/VideoCard';
import { LayoutGrid, Clock, RefreshCw } from 'lucide-react';

function VideoCardSkeleton() {
  return (
    <div className="soft-card p-5">
      <div className="aspect-video rounded-xl skeleton mb-4" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}

export default function DashboardPage() {
  const [videos,      setVideos]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const fetchVideos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res  = await fetch('/api/videos');
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Failed to fetch videos', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleUploadComplete = useCallback((newVideo) => {
    setVideos((prev) => [newVideo, ...prev]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Upload a video to start transcribing and generating AI metadata.
          </p>
        </div>

        {/* Upload zone */}
        <section className="mb-12">
          <VideoUploadDropzone onUploadComplete={handleUploadComplete} />
        </section>

        {/* Video library */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <LayoutGrid size={20} className="text-brand-500" />
              Your Videos
              {videos.length > 0 && (
                <span className="text-sm font-normal text-slate-400 ml-1">({videos.length})</span>
              )}
            </h2>

            <button
              onClick={() => fetchVideos(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <VideoCardSkeleton key={i} />)}
            </div>
          ) : videos.length === 0 ? (
            <div className="soft-card py-20 text-center">
              <Clock size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-400 font-medium">No videos yet</p>
              <p className="text-slate-300 dark:text-slate-600 text-sm mt-1">
                Upload your first video above to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

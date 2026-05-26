'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Film, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const MAX_DURATION_S = 600; // 10 minutes
const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const ALLOWED_TYPES  = { 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'] };

/** Get video duration (seconds) using a hidden <video> element. */
function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(el.src);
      resolve(el.duration);
    };
    el.onerror = reject;
    el.src = URL.createObjectURL(file);
  });
}

/** XHR upload so we get real progress percentage. */
function uploadWithProgress(formData, duration, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText).video);
      } else {
        try {
          reject(new Error(JSON.parse(xhr.responseText).error || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error — check your connection'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));

    xhr.open('POST', '/api/videos/upload');
    // Pass duration as header for server-side double-check
    if (duration) xhr.setRequestHeader('x-video-duration', String(duration));
    xhr.timeout = 10 * 60 * 1000; // 10 min
    xhr.send(formData);
  });
}

export default function VideoUploadDropzone({ onUploadComplete }) {
  const [state,    setState]    = useState('idle'); // idle | validating | uploading | success
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState(null);

  const processFile = useCallback(async (file) => {
    setError(null);
    setState('validating');

    // Client-side duration check (instant, no upload yet)
    let duration;
    try {
      duration = await getVideoDuration(file);
    } catch {
      duration = null; // Can't read metadata — let server validate
    }

    if (duration !== null && duration > MAX_DURATION_S) {
      const mins = (duration / 60).toFixed(1);
      const msg  = `Video is ${mins} min long. Maximum allowed is 10 minutes.`;
      setError(msg);
      setState('idle');
      toast.error(msg);
      return;
    }

    setState('uploading');
    setProgress(0);

    const formData = new FormData();
    formData.append('video', file);

    try {
      const video = await uploadWithProgress(formData, duration, setProgress);
      setState('success');
      toast.success('Video uploaded successfully!');
      onUploadComplete?.(video);
      // Reset after 2s so user can upload another
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setError(err.message);
      setState('idle');
      toast.error(err.message);
    }
  }, [onUploadComplete]);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const reason = rejected[0].errors?.[0]?.message || 'File rejected';
      setError(reason);
      toast.error(reason);
      return;
    }
    if (accepted.length > 0) processFile(accepted[0]);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept:   ALLOWED_TYPES,
    multiple: false,
    maxSize:  MAX_SIZE_BYTES,
    disabled: state === 'uploading' || state === 'validating',
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center
          cursor-pointer transition-all duration-200 select-none
          ${isDragActive && !isDragReject ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 scale-[1.01]' : ''}
          ${isDragReject             ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : ''}
          ${!isDragActive && state === 'idle' ? 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/20' : ''}
          ${state === 'uploading' || state === 'validating' ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-950/30' : ''}
          ${state === 'success'   ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20' : ''}
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${isDragActive ? 'bg-brand-100 dark:bg-brand-900/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {isDragActive
                  ? <Film size={28} className="text-brand-500 animate-bounce" />
                  : <Upload size={28} className="text-slate-400" />
                }
              </div>
              <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg mb-1">
                {isDragActive ? 'Drop to upload!' : 'Drag & drop your video here'}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">
                MP4, MOV, AVI, MKV, WebM — max 500 MB · max 10 minutes
              </p>
              <span className="btn-soft text-sm">Browse Files</span>
            </motion.div>
          )}

          {state === 'validating' && (
            <motion.div key="validating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center">
                <Film size={28} className="text-brand-400 animate-pulse" />
              </div>
              <p className="text-brand-600 dark:text-brand-400 font-semibold">Checking video duration…</p>
            </motion.div>
          )}

          {state === 'uploading' && (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center">
                <Upload size={28} className="text-brand-500" />
              </div>
              <p className="text-brand-600 dark:text-brand-400 font-semibold text-lg mb-4">
                Uploading… {progress}%
              </p>
              <div className="w-full max-w-sm mx-auto bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">Uploaded successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-start gap-2 text-red-500 text-sm"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}

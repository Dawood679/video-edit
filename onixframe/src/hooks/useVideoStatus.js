'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const TERMINAL_STATES = new Set([
  'TRANSCRIBED',
  'METADATA_GENERATED',
  'ENHANCED',
  'COMPLETE',
  'FAILED',
]);
const POLL_INTERVAL_MS = 2000;

/**
 * Polls /api/videos/[id]/status every 2 seconds until the video reaches
 * a terminal state, then stops automatically.
 *
 * @param {string|null} videoId
 * @returns {{ status: string|null, processingJobs: object[], loading: boolean, refetch: () => void }}
 */
export function useVideoStatus(videoId) {
  const [status,         setStatus]         = useState(null);
  const [processingJobs, setProcessingJobs] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const intervalRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    if (!videoId) return;
    try {
      const res  = await fetch(`/api/videos/${videoId}/status`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status);
      setProcessingJobs(data.processingJobs || []);
      setLoading(false);

      // Stop polling once we hit a terminal state
      if (TERMINAL_STATES.has(data.status)) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch {
      // Silently ignore network errors — keep polling
    }
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [videoId, fetchStatus]);

  // Allow callers to manually trigger a refresh (e.g. after starting a new job)
  const refetch = useCallback(() => {
    setLoading(true);
    fetchStatus();
    // Restart polling if it was stopped
    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    }
  }, [fetchStatus]);

  return { status, processingJobs, loading, refetch };
}

// web/src/hooks/useElectionSchedule.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchSchedule } from '../src/api/sjbuApi';

export type Phase = 'PRE' | 'LIVE' | 'POST_WAIT' | 'POST' | 'UNKNOWN';
export type Schedule = {
  electionKey: string;
  startDate: string | null;
  endDate: string | null;
  resultsAnnouncement: string | null;
  updatedAt: string | null;
  updatedBy: number | null;
};

export function derivePhase(now: Date, start?: Date | null, end?: Date | null, results?: Date | null): Phase {
  if (!start || !end) return 'UNKNOWN';
  if (now < start) return 'PRE';
  if (now >= start && now < end) return 'LIVE';
  if (now >= end && (!results || now < results)) return 'POST_WAIT';
  if (results && now >= results) return 'POST';
  return 'UNKNOWN';
}

export default function useElectionSchedule(pollMs = 15000) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [phase, setPhase] = useState<Phase>('UNKNOWN');
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const s = await fetchSchedule();
      setSchedule(s);
      const now = new Date();
      const start = s.startDate ? new Date(s.startDate) : null;
      const end = s.endDate ? new Date(s.endDate) : null;
      const results = s.resultsAnnouncement ? new Date(s.resultsAnnouncement) : null;
      setPhase(derivePhase(now, start, end, results));
    } catch (err) {
      console.error('Failed to fetch schedule', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = window.setInterval(load, pollMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [load, pollMs]);

  const refresh = useCallback(() => load(), [load]);

  return { schedule, phase, loading, refresh };
}
//take note

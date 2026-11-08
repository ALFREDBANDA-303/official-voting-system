// web/pages/OfficialResultsPage.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Position, Page, Candidate } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import CountdownTimer from '../components/CountdownTimer';

interface PositionWithCandidates extends Position {
  candidates: Candidate[];
  totalVotes?: number;
  voterTurnout?: number;
}

interface OfficialResultsPageProps {
  positions: PositionWithCandidates[];
  setPage: (page: Page) => void;
  schedule?: any;
  scheduleLoading?: boolean;
}

/**
 * OfficialResultsPage
 * - Authoritative server schedule used when available.
 * - If resultsAnnouncement is missing and election has ended, create a 30-minute client fallback persisted to localStorage.
 * - Parent clock (interval) is the single source of truth for button enablement and countdown display.
 */
const OfficialResultsPage: React.FC<OfficialResultsPageProps> = ({ setPage, schedule, scheduleLoading }) => {
  const CLOCK_TICK_MS = 500;
  const UI_SAFETY_MS = 500; // small UI margin
  const FALLBACK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  const LOCALSTORAGE_PREFIX = 'sjbu:fallbackAnnouncement:';

  // helpers
  const parseDateOrNull = (raw: any): Date | null => {
    if (raw === undefined || raw === null) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };
  const getFallbackKey = (key?: string) => `${LOCALSTORAGE_PREFIX}${key ?? 'unknown'}`;
  const readPersistedFallback = (electionKey?: string): Date | null => {
    if (!electionKey) return null;
    try {
      const raw = localStorage.getItem(getFallbackKey(electionKey));
      if (!raw) return null;
      const t = new Date(raw);
      return isNaN(t.getTime()) ? null : t;
    } catch {
      return null;
    }
  };
  const persistFallback = (electionKey: string | undefined, date: Date) => {
    if (!electionKey) return;
    try { localStorage.setItem(getFallbackKey(electionKey), date.toISOString()); } catch {}
  };
  const clearPersistedFallback = (electionKey?: string) => {
    if (!electionKey) return;
    try { localStorage.removeItem(getFallbackKey(electionKey)); } catch {}
  };

  // accept common backend key variants
  const rawStart =
    schedule?.startDate ??
    schedule?.start_date ??
    schedule?.startDateUtc ??
    schedule?.start_date_utc ??
    null;
  const rawEnd =
    schedule?.endDate ??
    schedule?.end_date ??
    schedule?.endDateUtc ??
    schedule?.end_date_utc ??
    null;
  const rawResults =
    schedule?.resultsAnnouncement ??
    schedule?.results_announcement ??
    schedule?.resultAnnouncement ??
    schedule?.result_announcement ??
    schedule?.resultsAnnouncementUtc ??
    schedule?.results_announcement_utc ??
    null;

  const startDate = parseDateOrNull(rawStart);
  const endDate = parseDateOrNull(rawEnd);
  const resultsAnnouncement = parseDateOrNull(rawResults);
  const electionKey = schedule?.electionKey ?? schedule?.election_key ?? 'unknown';

  // parent clock
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  // persisted fallback state (read once from localStorage)
  const [persistedFallback, setPersistedFallback] = useState<Date | null>(() => readPersistedFallback(electionKey));

  // manage persisted fallback lifecycle
  useEffect(() => {
    // server provided -> clear persisted fallback
    if (resultsAnnouncement) {
      clearPersistedFallback(electionKey);
      setPersistedFallback(null);
      return;
    }

    // only create fallback when endDate exists and election has ended
    if (endDate && now.getTime() >= endDate.getTime()) {
      // keep existing if still valid
      if (persistedFallback && persistedFallback.getTime() > now.getTime()) return;
      const newFallback = new Date(Date.now() + FALLBACK_DURATION_MS);
      persistFallback(electionKey, newFallback);
      setPersistedFallback(newFallback);
      return;
    }

    // if election reopened or before end, clear any fallback
    if (endDate && now.getTime() < endDate.getTime()) {
      clearPersistedFallback(electionKey);
      setPersistedFallback(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate, resultsAnnouncement, now, electionKey]);

  // effective announcement target: server first, then persisted fallback
  const effectiveAnnouncementTarget: Date | null = resultsAnnouncement ?? persistedFallback;

  // derive phase safely (only using server timestamps to decide UNKNOWN/PRE/LIVE/POST_WAIT/POST)
  type Phase = 'UNKNOWN' | 'PRE' | 'LIVE' | 'POST_WAIT' | 'POST';
  const derivePhase = (): Phase => {
    const ms = now.getTime();
    if (!startDate || !endDate) return 'UNKNOWN';
    if (ms < startDate.getTime()) return 'PRE';
    if (ms >= startDate.getTime() && ms < endDate.getTime()) return 'LIVE';
    // after endDate
    if (!effectiveAnnouncementTarget) return 'POST_WAIT';
    if (ms >= endDate.getTime() && ms < effectiveAnnouncementTarget.getTime()) return 'POST_WAIT';
    if (ms >= effectiveAnnouncementTarget.getTime()) return 'POST';
    return 'UNKNOWN';
  };
  const phase = derivePhase();

  // enable button only when effective announcement target exists and has passed
  const isReady = effectiveAnnouncementTarget ? now.getTime() + UI_SAFETY_MS >= effectiveAnnouncementTarget.getTime() : false;

  // harmless display fallbacks for CountdownTimer so UI doesn't crash when server data missing
  const votingClosesTarget = endDate ?? new Date(Date.now() + 1000 * 3);
  const announcementTarget = effectiveAnnouncementTarget ?? new Date(Date.now() + 1000 * 3);

  return (
    <div className="container px-4 py-6 min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-3xl p-6 md:p-12 text-center bg-gradient-to-br from-dmi-blue-900 to-dmi-blue-800 text-white shadow-2xl">
        {/* schedule missing banner */}
        {(scheduleLoading === false) && (!startDate || !endDate) && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 text-yellow-800 text-sm">
            <strong>Schedule incomplete:</strong>{' '}
            {!startDate && 'start time not set.'}
            {!startDate && !endDate && ' '}
            {!endDate && 'end time not set.'}
            {' '}Please ask an administrator to configure start/end times on the server.
          </div>
        )}

        {/* UI per phase */}
        {phase === 'UNKNOWN' && (
          <>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Election schedule unavailable</h1>
            <p className="text-base md:text-lg text-dmi-blue-100 mt-3">Server schedule missing or incomplete. Administrators must configure start and end times.</p>
            <div className="mt-6 md:mt-10">
              <Button size="lg" variant="secondary" disabled className="w-full md:w-auto">Awaiting Schedule Configuration</Button>
            </div>
          </>
        )}

        {phase === 'PRE' && (
          <>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Voting Not Started</h1>
            <p className="text-base md:text-lg text-dmi-blue-100 mt-3">Voting will begin at the official start time.</p>
            <div className="py-6">
              <CountdownTimer targetDate={startDate ?? votingClosesTarget} title="Election Starts In" onCompleteMessage="The Election is Now Live!" />
            </div>
            <div className="mt-6 md:mt-10">
              <Button size="lg" variant="secondary" disabled className="w-full md:w-auto">Awaiting Start of Voting</Button>
            </div>
          </>
        )}

        {phase === 'LIVE' && (
          <>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Voting in Progress</h1>
            <p className="text-base md:text-lg text-dmi-blue-100 mt-3">Voting is currently live. Final results will be announced after polling closes.</p>
            <div className="py-6">
              <CountdownTimer targetDate={endDate ?? votingClosesTarget} title="Voting Closes In" onCompleteMessage="Voting has officially ended." />
            </div>
            <div className="mt-6 md:mt-10">
              <Button size="lg" variant="secondary" disabled className="w-full md:w-auto">Results unavailable during voting</Button>
            </div>
          </>
        )}

        {phase === 'POST_WAIT' && (
          <>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Voting Closed — Awaiting Announcement</h1>
            <p className="text-base md:text-lg text-dmi-blue-100 mt-3">Voting has ended. Please wait for the official results announcement time.</p>

            {effectiveAnnouncementTarget ? (
              <div className="py-6">
                <CountdownTimer targetDate={announcementTarget} title="Official Announcement In" onCompleteMessage="Results Verified!" />
                {persistedFallback && !resultsAnnouncement && (
                  <p className="mt-2 text-sm text-yellow-200">Using local 30‑minute fallback announcement time.</p>
                )}
              </div>
            ) : (
              <div className="py-6">
                <div className="p-4 rounded-md bg-yellow-50 text-yellow-800 text-sm">Official announcement time not set on the server. Administrators must set resultsAnnouncement before winners can be revealed.</div>
              </div>
            )}

            <div className="mt-6 md:mt-10">
              <Button size="lg" variant="secondary" disabled className="w-full md:w-auto">Awaiting Final Count...</Button>
            </div>
          </>
        )}

        {phase === 'POST' && (
          <>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Results Are In!</h1>
            <p className="text-base md:text-xl text-dmi-blue-100 mt-3">The official results have been announced.</p>

            <div className="mt-6 md:mt-10">
              <Button
                size="lg"
                variant={isReady ? 'primary' : 'secondary'}
                disabled={!isReady}
                onClick={() => setPage(Page.Winners)}
                className={`w-full md:w-auto min-h-touch px-6 py-3 font-bold transition-all duration-500 ${isReady ? 'hover:scale-105 shadow-lg shadow-dmi-gold-500/50' : 'opacity-50 cursor-not-allowed'}`}
              >
                {isReady ? 'Reveal Official Winners' : 'Awaiting Final Count...'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default OfficialResultsPage;

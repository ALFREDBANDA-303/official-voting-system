// web/hooks/useResultsStats.ts

import { useCallback, useEffect, useState } from 'react';

export interface ResultsStats {
    overall?: {
        totalVotes: number;
        eligibleVoters: number;
    };
    positions?: Record<
        string,
        {
            votes: Record<string, number>;
            // other per-position metadata can be added here
        }
    >;
    // optional auxiliary data for charts
    hourlyTurnout?: any[];
    stationStatus?: any[];
}

export const useResultsStats = () => {
    const [stats, setStats] = useState<ResultsStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchStats = useCallback(async (signal?: AbortSignal) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/v1/stats/', { signal });
            if (!res.ok) {
                throw new Error(`Failed to load stats: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            // normalize minimal shape if backend doesn't provide optional fields
            const normalized: ResultsStats = {
                overall: data.overall ?? data,
                positions: data.positions ?? {},
                hourlyTurnout: data.hourlyTurnout ?? [],
                stationStatus: data.stationStatus ?? [],
            };
            setStats(normalized);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err);
            setStats(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const ac = new AbortController();
        fetchStats(ac.signal);
        return () => ac.abort();
    }, [fetchStats]);

    return { stats, isLoading, error, refetch: fetchStats as (signal?: AbortSignal) => Promise<void> };
};

export default useResultsStats;
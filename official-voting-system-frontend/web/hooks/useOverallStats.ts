// web/hooks/useOverallStats.ts

import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import axios, { isAxiosError } from 'axios'; 

// Inferred structure based on VotingStats schema (Page 40)
interface OverallStats {
    totalVoters: number;
    totalVotesCast: number;
    voterTurnout: number; // float
    positionsWithStats: any[]; 
    overallStats: {
        totalPositions: number;
        totalCandidates: number;
    };
}

interface StatsState {
    stats: OverallStats | null;
    isLoading: boolean;
    error: string | null;
    fetchStats: () => Promise<void>;
}

export const useOverallStats = (): StatsState => {
    const [stats, setStats] = useState<OverallStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // API Endpoint: GET /stats/overall
            const response = await sjbuApi.get('/stats/overall');
            setStats(response.data.data);
        } catch (e) {
            let message = 'Failed to load overall voting statistics.';
            
            if (isAxiosError(e) && e.response) {
                 const status = e.response.status;

                 // FINAL PRODUCTION FIX: Remove the restrictive 401/403 check 
                 // The error message must be generic, indicating a server failure (if 400+) or network failure.
                 if (status >= 400) {
                     message = `Server Error (${status}). Data not available.`;
                 } else {
                     message = 'Network connection failed.';
                 }
            }
            setError(message);
            console.error('Fetch Overall Stats Error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data only once on mount
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, error, fetchStats };
};
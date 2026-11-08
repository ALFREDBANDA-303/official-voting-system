// web/hooks/useLiveStatsPolling.ts

import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import axios from 'axios'; // Import axios for isAxiosError check

// Inferred structure for live stats (Page 28 OCR)
interface LiveStats {
    totalVoters: number;
    totalVotesCast: number;
    voterTurnout: number; // float
    positionsWithStats: any[];
    // The API doesn't provide granular data like hourlyTurnout or stationStatus,
    // so we'll only rely on what's available.
}

interface LiveStatsState {
    stats: LiveStats | null;
    isLoading: boolean;
    error: string | null;
}

const POLLING_INTERVAL = 5000; // Poll every 5 seconds for "live" feel

export const useLiveStatsPolling = (): LiveStatsState => {
    const [stats, setStats] = useState<LiveStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        
        try {
            // API Endpoint: GET /stats/overall (Proceed with fetch)
            const response = await sjbuApi.get('/stats/overall');
            setStats(response.data.data);
            setError(null);
        } catch (e) {
            let message = 'Failed to load live statistics.';
            
            if (axios.isAxiosError(e) && e.response) { 
                 const status = e.response.status;

                 // FINAL FIX: Treat 401/403 as a public restriction/data not yet ready, not a fatal error
                 if (status === 401 || status === 403) {
                     message = 'Statistics are currently restricted or still loading.';
                 } else if (status >= 500) {
                     message = `Server Error (${status}). Data temporarily unavailable.`;
                 } else if (status === 404) {
                     message = 'Statistics service not found on the server.';
                 }
            }
            setError(message);
            console.error('Fetch Live Stats Error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // FINAL FIX: One-time fetch on mount to check status
        fetchStats();

        // Re-implement simplified polling to ensure the page eventually gets data, 
        // but not in the aggressive way that causes cascade errors.
        const interval = setInterval(fetchStats, POLLING_INTERVAL); 

        // Cleanup: stop polling on unmount
        return () => clearInterval(interval);
    }, [fetchStats]);

    return { stats, isLoading, error };
};
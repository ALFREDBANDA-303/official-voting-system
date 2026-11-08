// web/hooks/useVotingTrends.ts

import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import axios from 'axios'; // ADDED: Import axios for isAxiosError check

interface TrendData {
    hour: string;
    votes: number;
}

interface TrendsState {
    hourlyTrends: TrendData[];
    isLoading: boolean;
    error: string | null;
    fetchTrends: () => Promise<void>;
}

const TRENDS_POLLING_INTERVAL = 30000; // Poll every 30 seconds

export const useVotingTrends = (): TrendsState => {
    const [hourlyTrends, setHourlyTrends] = useState<TrendData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrends = useCallback(async () => {
        setIsLoading(true); // Setting loading to true ensures UI updates correctly on refetch
        try {
            // API Endpoint: GET /stats/trends (Proceed with fetch)
            const response = await sjbuApi.get('/stats/trends');
            // The API returns { data: { hourlyPattern: [...] } }
            const rawHourlyData = response.data.data.hourlyPattern || [];

            // Map data to chart format { hour: 'H', votes: N }
            const mappedTrends = rawHourlyData.map((item: any) => ({
                hour: `${item.hour}:00`, // Convert hour (e.g., 8) to "8:00"
                votes: item.votes_count,
            }));

            setHourlyTrends(mappedTrends);
            setError(null);
        } catch (e) {
            let message = 'Failed to load chart data.';

            if (axios.isAxiosError(e) && e.response) { 
                 const status = e.response.status;

                 // CRITICAL FIX: Treat 401/403 as a warning, not a definitive failure, for public-facing results
                 if (status === 401 || status === 403) {
                     message = 'Chart data is temporarily unavailable. Access Restricted.';
                 } else if (status >= 500) {
                     message = `Server Error (${status}). Data temporarily unavailable.`;
                 } else if (status === 404) {
                     message = 'Trends service not found on the server.';
                 }
            }
            setError(message);
            console.error('Fetch Voting Trends Error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrends();
        const interval = setInterval(fetchTrends, TRENDS_POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchTrends]);

    return { hourlyTrends, isLoading, error, fetchTrends };
};
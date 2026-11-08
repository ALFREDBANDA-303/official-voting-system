// web/hooks/useAuditLogs.ts

import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import { AuditLogEntry } from '../types'; 

interface AuditLogState {
    logs: AuditLogEntry[];
    isLoading: boolean;
    error: string | null;
    fetchLogs: (limit?: number, offset?: number) => Promise<void>;
}

export const useAuditLogs = (): AuditLogState => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Limit and offset are query parameters for the API endpoint (Page 26 OCR)
    const fetchLogs = useCallback(async (limit = 50, offset = 0) => {
        setIsLoading(true);
        setError(null);
        try {
            // API Endpoint: GET /audit/logs
            const response = await sjbuApi.get('/audit/logs', {
                params: { limit, offset }
            });
            
            // CRITICAL FIX: Pull the 'logs' array from the nested data object
            // The backend returns: { success: true, data: { logs: [...] } }
            const liveLogs: any[] = response.data.data.logs || [];
            console.log('Raw audit logs response:', response.data);
            
            // Final Mapping to ensure Date objects are created for filtering/sorting
            const mappedLogs: AuditLogEntry[] = liveLogs.map(log => ({
                // Use a proper string or number ID for React keys
                id: log.id ? log.id.toString() : new Date().getTime().toString() + Math.random(), 
                // Ensure timestamp is a Date object for frontend sorting
                timestamp: new Date(log.timestamp), 
                adminUsername: log.adminUsername || 'system',
                action: log.action || 'Unknown Action',
                details: log.details || 'N/A',
                ipAddress: log.ipAddress || 'N/A',
            })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            setLogs(mappedLogs);

        } catch (e) {
            let message = 'Failed to load audit logs.';
            if (sjbuApi.isAxiosError(e) && e.response) {
                if (e.response.status === 403) {
                     message = 'Insufficient permissions to view audit logs.';
                } else if (e.response.status === 404) {
                     message = 'Audit Log endpoint not found.';
                } else {
                     message = `Server Error (${e.response.status}).`;
                }
            }
            setError(message);
            console.error('Fetch Audit Logs Error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch on mount
        fetchLogs();
    }, [fetchLogs]);

    return { logs, isLoading, error, fetchLogs };
};
















































































































































































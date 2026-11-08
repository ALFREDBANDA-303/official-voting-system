// web/hooks/useAdminUsers.ts

import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import { AdminUser } from '../types'; // Assuming AdminUser type is in types.ts

interface AdminUsersState {
    adminUsers: AdminUser[];
    isLoading: boolean;
    error: string | null;
    fetchAdminUsers: () => Promise<void>;
}

export const useAdminUsers = (): AdminUsersState => {
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAdminUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // API Endpoint: GET /admin/all
            const response = await sjbuApi.get('/admin/all');
            // The API returns { "admins": [ ... ] } (Page 6 OCR)
            setAdminUsers(response.data.admins || []);
        } catch (e) {
            let message = 'Failed to load admin users.';
            if (sjbuApi.isAxiosError(e) && e.response?.status === 403) {
                 message = 'Insufficient permissions to view admin users.';
            }
            setError(message);
            console.error('Fetch Admin Users Error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch on mount
        fetchAdminUsers();
    }, [fetchAdminUsers]);

    return { adminUsers, isLoading, error, fetchAdminUsers };
};
// web/hooks/useAllPositions.ts

import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import { isAxiosError } from 'axios';
import { Position, Candidate } from '../types';

interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}

interface AllPositionsState {
  positions: PositionWithCandidates[];
  isLoading: boolean;
  error: string | null;
  fetchPositions: () => Promise<void>;
}

/**
 * Custom hook to fetch all positions and their candidates from the backend.
 * Now includes imageUrl from the updated controller response.
 */
export const useAllPositions = (): AllPositionsState => {
  const [positions, setPositions] = useState<PositionWithCandidates[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await sjbuApi.getAllPositionsWithCandidates();

      const rawPositions = response.data.positions || [];

      const mappedPositions: PositionWithCandidates[] = rawPositions.map((p: any) => ({
        id: p.id,
        name: p.name,
        candidates: p.candidates.map((c: any) => ({
          id: c.id,
          name: c.name,
          positionId: c.positionId,
          manifesto: c.manifesto,
          imageUrl: typeof c.imageUrl === 'string' ? c.imageUrl.trim() : '', // ✅ Safe mapping
        })),
      }));

      setPositions(mappedPositions);
      setError(null);
    } catch (e) {
      const message = isAxiosError(e) && e.response?.data?.error || 'Failed to load positions and candidates.';
      setError(message);
      console.error('Fetch All Positions Error:', e);
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return { positions, isLoading, error, fetchPositions };
};

// web/hooks/useVotingData.ts

import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import { Position, Candidate } from '../types'; // Assuming Position and Candidate types exist

// Extend the Position type to include candidates for the frontend structure
interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}

interface VotingDataState {
  positions: PositionWithCandidates[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

// A helper function to fetch candidates for a single position
const fetchCandidatesForPosition = async (positionId: number): Promise<Candidate[]> => {
    try {
        // API Endpoint: GET /positions/{positionId}/candidates
        const response = await sjbuApi.get(`/positions/${positionId}/candidates`);
        // The API returns { "data": [ ...candidates ] } (Page 17 OCR)
        // FIX: The backend Candidate type is mostly aligned, no major mapping needed here unless IDs are strings.
        return response.data.data || []; 
    } catch (e) {
        console.error(`Error fetching candidates for position ${positionId}`, e);
        return [];
    }
}

export const useVotingData = (): VotingDataState => {
  const [positions, setPositions] = useState<PositionWithCandidates[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch all positions
      // API Endpoint: GET /positions
      const positionsResponse = await sjbuApi.get('/positions');
      // The API returns { "data": [ ...positions ] } (Page 14 OCR)
      const rawPositions: any[] = positionsResponse.data.data || [];
      
      if (rawPositions.length === 0) {
          setIsLoading(false);
          setPositions([]);
          return;
      }

      // FIX: Map the backend's raw data (with position_name) to the frontend's Position type (with name)
      const basePositions: Position[] = rawPositions.map(rawPos => ({
          id: rawPos.id,
          name: rawPos.position_name, // MAPPED: position_name -> name
          candidates: [] // Placeholder, will be filled in the next step
      }));

      // 2. Fetch candidates for all positions concurrently
      const positionPromises = basePositions.map(async (position) => {
        const candidates = await fetchCandidatesForPosition(position.id);
        
        // 3. Combine Position and Candidates data
        return {
          ...position,
          candidates: candidates,
        } as PositionWithCandidates;
      });

      const positionsWithCandidates = await Promise.all(positionPromises);
      setPositions(positionsWithCandidates);

    } catch (e) {
      setError('Failed to load election data. Please check connection.');
      console.error('Full election data fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data only once on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { positions, isLoading, error, fetchData };
};
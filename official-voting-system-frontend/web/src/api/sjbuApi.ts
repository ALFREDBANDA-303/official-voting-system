// web/src/api/sjbuApi.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios';
// Assuming you have a file that defines common types, otherwise we use 'any'
// import { SignatureResponse } from '../types'; 

export type ScheduleDto = {
  electionKey: string;
  startDate: string | null;
  endDate: string | null;
  resultsAnnouncement: string | null;
  updatedAt: string | null;
  updatedBy: number | null;
};

export const fetchSchedule = async (): Promise<ScheduleDto> => {
  const res = await sjbuApi.get('/election/schedule'); // mounted at /api/app/election
  return res.data;
};

export const updateSchedule = async (payload: {
  startDate: string;
  endDate: string;
  resultsAnnouncement?: string | null;
}) => {
  const res = await sjbuApi.post('/election/schedule', payload);
  return res.data;
};

// --- UPDATED INTERFACES FOR CANDIDATE MANAGEMENT (STRICT SCHEMA) ---
// Interface for fetching positions with candidates (matches ElectionService DTO)
interface PositionWithCandidatesResponse {
    id: number;
    name: string; // The DTO uses name, while the DB uses position_name
    candidates: CandidateResponse[];
}

// Interface for creating a candidate (matches NewCandidateData in backend)
interface CandidateData {
    name: string;
    positionId: number;
    imageUrl: string; 
    manifesto: string; // CRITICAL FIX: Changed from 'bio' to 'manifesto'
}

// Interface for updating a candidate (matches UpdateCandidateData in backend)
interface UpdateCandidatePayload {
    name?: string;
    positionId?: number;
    imageUrl?: string;
    manifesto?: string; // CRITICAL FIX: Changed from 'bio' to 'manifesto'
}

// Interface for a returned candidate (matches stripped-down DTO from backend service)
interface CandidateResponse {
    id: number;
    name: string;
    positionId: number;
    imageUrl: string;
    manifesto: string;
    // CRITICAL FIX: Removed unmapped fields to match strict schema
}
// --- END NEW INTERFACES ---

// Get base URL from environment variable
 const baseURL = process.env.REACT_APP_API_URL;
/// const baseURL = 'http://localhost:3005/api/app'; 


// Create an Axios instance
const API: AxiosInstance = axios.create({ 
  baseURL: baseURL,
  // CRITICAL FIX: Increase timeout to 30 seconds (30000ms) for stability under slow database connection
  timeout: 70000, 
  withCredentials: true, // IMPORTANT: Allows sending and receiving HTTP-only cookies for auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add request interceptor for logging/security checks
API.interceptors.request.use(
  (config) => {
    // Example: Log the request URL
    console.log(`[API] Request to: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//response interceptor for global error handling or logging
API.interceptors.response.use(
  (response) => {
    // Example: Log successful response
    console.log(`[API] Success response from: ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle specific error codes globally (e.g., redirect to login on 401)
    if (error.response) {
      console.error(`[API] Error response (${error.response.status}) from: ${error.config.url}`);
      // if (error.response.status === 401) {
      //   // Handle Unauthorized globally, e.g., clear user state and redirect
      // }
    } else if (error.request) {
      console.error("[API] No response received from server.");
    } else {
      console.error("[API] Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Requests a signed upload signature from the backend for Cloudinary.
 * This is the first step in the secure image upload process (Task A).
 * @returns {Promise<AxiosResponse<any>>} Object containing signature, timestamp, cloudName, etc.
 */
const getCloudinarySignature = (): Promise<AxiosResponse<any>> => {
  // Targets the POST /api/app/admin/sign-upload endpoint
  return API.post('/admin/sign-upload'); 
};

// --- CANDIDATE/POSITION MANAGEMENT FUNCTIONS ---

/**
 * Creates a new candidate.
 */
const createCandidate = (data: CandidateData): Promise<AxiosResponse<{ candidate: CandidateResponse }>> => {
    return API.post('/admin/candidate', data);
};

/**
 * Updates an existing candidate.
 */
const updateCandidate = (candidateId: number, data: UpdateCandidatePayload): Promise<AxiosResponse<{ candidate: CandidateResponse }>> => {
    return API.put(`/admin/candidate/${candidateId}`, data);
};

/**
 * Gets all positions with their candidates.
 * This function addresses the Vice-President/Position fetching issue.
 */
const getAllPositionsWithCandidates = (): Promise<AxiosResponse<{ positions: PositionWithCandidatesResponse[] }>> => {
    // Targets the GET /api/app/election/positions endpoint
    return API.get('/election/positions'); 
};

// CRITICAL FIX: Extend the type definition to include all new functions
interface ExtendedAxiosInstance extends AxiosInstance {
    getCloudinarySignature: () => Promise<AxiosResponse<any>>;
    createCandidate: (data: CandidateData) => Promise<AxiosResponse<{ candidate: CandidateResponse }>>;
    updateCandidate: (candidateId: number, data: UpdateCandidatePayload) => Promise<AxiosResponse<{ candidate: CandidateResponse }>>;
    getAllPositionsWithCandidates: () => Promise<AxiosResponse<{ positions: PositionWithCandidatesResponse[] }>>; // NEW
}

// Now, cast the instance to the extended type and attach the functions:
const sjbuApi = API as ExtendedAxiosInstance;
sjbuApi.getCloudinarySignature = getCloudinarySignature;
sjbuApi.createCandidate = createCandidate;
sjbuApi.updateCandidate = updateCandidate;
sjbuApi.getAllPositionsWithCandidates = getAllPositionsWithCandidates; // NEW

export default sjbuApi; // Exporting the original Axios instance (now extended)

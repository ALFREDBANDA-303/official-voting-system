// web/types.ts

export enum Page {
  Intro,
  Home,
  Authentication,
  Voting,
  VoteSuccess,
  Verification,
  Results,
  Winners,
  AdminLogin,
  Admin,
  CandidateGallery,     
  HowToVote,            
  TermsOfUse,           
  PrivacyPolicy,        
  ContactHelp,  
  MeetTheTeam         
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminUser {
  id: number;
  username: string;
  role: AdminRole;
  email: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  password?: string;
}

export interface Candidate {
  id: number;
  name: string;
  imageUrl: string;
  manifesto: string;
}

export interface Position {
  id: number;
  name: string;
  candidates: Candidate[];
  totalVotes?: number;
  voterTurnout?: number;
}

export interface VoteSelection {
  [positionId: number]: number | 'abstain';
}

export interface CandidateStats {
    candidateId: number;
    candidateName: string;
    manifesto?: string;
    voteCount: number;
    votePercentage: number;
}

export interface PositionStats {
    positionId: number;
    positionName: string;
    totalCandidates: number;
    totalVotes: number;
    voterTurnout: number;
    candidates: CandidateStats[];
}

export interface OverallStats {
    totalPositions: number;
    totalCandidates: number;
    averageVotesPerPosition?: number;
    mostVotedPosition?: string;
    leastVotedPosition?: string;
}

export interface VotingStats {
    totalVoters: number;
    totalVotesCast: number;
    voterTurnout: number;
    positionsWithStats: PositionStats[];
    overallStats: OverallStats;
}

export type ElectionStatus = 'PRE_ELECTION' | 'LIVE' | 'POST_ELECTION';

export interface AuditLogEntry {
  id: number;
  timestamp: Date;
  adminUsername: string;
  action: string;
  details: string;
  ipAddress: string;
}
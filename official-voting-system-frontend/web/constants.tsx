import { Position, VotingStats, AdminUser, AuditLogEntry } from './types';

const now = new Date();
// Election starts in 1 day from now
export const ELECTION_START_DATE = new Date(now.getTime() + 1 * 10 * 10 * 10 * 999);
// Election ends 3 days from now (lasts for 2 days)
export const ELECTION_END_DATE = new Date(now.getTime() + 8 * 60 * 60 * 1000);

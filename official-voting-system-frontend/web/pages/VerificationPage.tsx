import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import sjbuApi from '../src/api/sjbuApi';
import { isAxiosError } from 'axios';

// ESCALATING RATE LIMIT CONSTANTS
const MAX_ATTEMPTS_PER_LEVEL = 5;
const LOCKOUT_LEVELS = [
    { threshold: 5, minutes: 5 },
    { threshold: 10, minutes: 15 },
];
const GLOBAL_ATTEMPT_LIMIT = LOCKOUT_LEVELS[1].threshold;

interface VerifiedVote {
    id: number;
    voucher: string;
    candidate_id: number;
    position_id: number;
    verification_code: string;
    voted_at?: string;
}

type SearchMode = 'code' | 'voucher';

const VerificationPage: React.FC = () => {
    const [searchInput, setSearchInput] = useState('');
    const [searchMode, setSearchMode] = useState<SearchMode>('code');
    const [status, setStatus] = useState<'idle' | 'loading' | 'verified' | 'error'>('idle');
    const [verifiedVote, setVerifiedVote] = useState<VerifiedVote | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

    const getLockoutInfo = useCallback((attempts: number) => {
        let minutes = 0;
        let attemptsLeft = GLOBAL_ATTEMPT_LIMIT - attempts;

        if (attempts > LOCKOUT_LEVELS[1].threshold) {
            minutes = LOCKOUT_LEVELS[1].minutes;
        } else if (attempts > LOCKOUT_LEVELS[0].threshold) {
            minutes = LOCKOUT_LEVELS[1].minutes;
        } else if (attempts > LOCKOUT_LEVELS[0].threshold) {
            minutes = LOCKOUT_LEVELS[0].minutes;
        }

        return {
            minutes,
            attemptsLeft: Math.max(0, attemptsLeft),
            lockRequired: minutes > 0
        };
    }, []);

    // Load saved attempts & lockout from localStorage
    useEffect(() => {
        try {
            const savedAttempts = localStorage.getItem('dmi-verify-attempts');
            if (savedAttempts) {
                const attempts = parseInt(savedAttempts, 10);
                setFailedAttempts(attempts);

                const lockoutInfo = getLockoutInfo(attempts);
                if (lockoutInfo.lockRequired) {
                    const savedLockout = localStorage.getItem('dmi-verify-lockout');
                    if (savedLockout) {
                        const lockoutDate = new Date(savedLockout);
                        if (lockoutDate > new Date()) {
                            setLockoutUntil(lockoutDate);
                            setErrorMessage(`Access is locked for ${lockoutInfo.minutes} minutes.`);
                        } else {
                            localStorage.removeItem('dmi-verify-lockout');
                            localStorage.removeItem('dmi-verify-attempts');
                            setFailedAttempts(0);
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Failed to read verification state from localStorage", e);
        }
    }, [getLockoutInfo]);

    // Countdown timer for lockout
    useEffect(() => {
        if (!lockoutUntil) return;

        const interval = setInterval(() => {
            if (new Date() >= lockoutUntil) {
                setLockoutUntil(null);
                setFailedAttempts(0);
                setErrorMessage('');
                localStorage.removeItem('dmi-verify-lockout');
                localStorage.removeItem('dmi-verify-attempts');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lockoutUntil]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lockoutUntil || !searchInput.trim()) return;

        setStatus('loading');
        setErrorMessage('');
        setVerifiedVote(null);

        try {
            const payload: any = {};
            if (searchMode === 'code') {
                payload.verification_code = searchInput.trim();
            } else {
                payload.voucher = searchInput.trim();
            }

            const response = await sjbuApi.post('/verify', payload);

            if (response.status === 200 && response.data.status === "found") {
                setVerifiedVote(response.data.vote as VerifiedVote);
                setStatus('verified');
                setFailedAttempts(0);
                localStorage.removeItem('dmi-verify-attempts');
                localStorage.removeItem('dmi-verify-lockout');
            } else {
                throw new Error('Unexpected response');
            }
        } catch (err) {
            const isNotFound = isAxiosError(err) && err.response?.status === 404;
            const isBadRequest = isAxiosError(err) && err.response?.status === 400;

            if (isNotFound || isBadRequest) {
                const newAttempts = failedAttempts + 1;
                setFailedAttempts(newAttempts);
                localStorage.setItem('dmi-verify-attempts', newAttempts.toString());

                const lockoutInfo = getLockoutInfo(newAttempts);

                if (lockoutInfo.lockRequired) {
                    const lockoutDate = new Date(Date.now() + lockoutInfo.minutes * 60 * 1000);
                    setLockoutUntil(lockoutDate);
                    localStorage.setItem('dmi-verify-lockout', lockoutDate.toISOString());
                    setErrorMessage(`Too many failed attempts. Locked for ${lockoutInfo.minutes} minutes.`);
                } else {
                    setErrorMessage(
                        `Invalid ${searchMode === 'code' ? 'verification code' : 'voter voucher'}. ` +
                        (newAttempts <= GLOBAL_ATTEMPT_LIMIT
                            ? `${lockoutInfo.attemptsLeft} attempt${lockoutInfo.attemptsLeft !== 1 ? 's' : ''} left.`
                            : '')
                    );
                }
            } else {
                setErrorMessage('Server error. Please try again later.');
            }
            setStatus('error');
        }
    };

    const renderLockoutView = () => {
        if (!lockoutUntil) return null;
        const timeLeft = Math.max(0, Math.floor((lockoutUntil.getTime() - new Date().getTime()) / 1000));
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        return (
            <div className="p-6 text-center">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-lg font-semibold text-dmi-blue-900">Access Locked</h3>
                <p className="text-gray-600 mt-2 text-sm">{errorMessage}</p>
                <div className="text-3xl font-mono font-bold text-red-600 my-4">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
            </div>
        );
    };

    const renderIdle = () => (
        <form onSubmit={handleVerify}>
            <h2 className="text-xl font-bold text-dmi-blue-900 mb-2">Vote Verification Portal</h2>
            <p className="text-gray-600 mb-6 text-sm">
                Verify your vote using either your <strong>Verification Code</strong> or <strong>Voter Voucher</strong>.
            </p>

            {/* Search Mode Toggle */}
            <div className="flex border border-gray-300 rounded-card overflow-hidden mb-4">
                <button
                    type="button"
                    onClick={() => { setSearchMode('code'); setSearchInput(''); }}
                    className={`flex-1 py-3 text-sm font-medium transition ${searchMode === 'code'
                        ? 'bg-dmi-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                >
                    Verification Code
                </button>
                <button
                    type="button"
                    onClick={() => { setSearchMode('voucher'); setSearchInput(''); }}
                    className={`flex-1 py-3 text-sm font-medium transition ${searchMode === 'voucher'
                        ? 'bg-dmi-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                >
                    Voter Voucher
                </button>
            </div>

            <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full text-center text-lg font-mono bg-gray-100 border-2 border-gray-300 rounded-card p-4 focus:outline-none focus:shadow-focus-ring focus:border-dmi-blue-500 text-dmi-blue-900 font-semibold placeholder-gray-400"
                placeholder={searchMode === 'code' ? 'SJBU-XXXX-XXXX' : 'XXXX-11111-XX'}
                autoFocus
                disabled={!!lockoutUntil}
            />

            {errorMessage && !lockoutUntil && (
                <p className="text-red-500 text-sm mt-3 text-center">{errorMessage}</p>
            )}

            <Button
                type="submit"
                className="w-full mt-5 min-h-touch rounded-btn text-base-mobile"
                size="lg"
                disabled={status === 'loading' || searchInput.trim().length === 0 || !!lockoutUntil}
            >
                {status === 'loading' ? <Spinner /> : 'Verify My Vote'}
            </Button>
        </form>
    );

    const renderResult = (isSuccess: boolean) => (
        <div className="text-center">
            {isSuccess ? (
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            ) : (
                <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            )}

            <h2 className={`text-xl font-bold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                {isSuccess ? 'Vote Verified Successfully' : 'Not Found'}
            </h2>
            <p className="text-gray-600 mt-2 text-sm">
                {isSuccess ? 'Your vote has been recorded and counted.' : errorMessage || 'No matching vote found.'}
            </p>

            {isSuccess && verifiedVote && (
                <div className="text-left bg-gray-100 p-4 rounded-card mt-5 text-sm text-gray-700 space-y-2 font-medium">
                    <p><strong>Verification Code:</strong> <span className="font-mono">{verifiedVote.verification_code}</span></p>
                    <p><strong>Voter Voucher:</strong> <span className="font-mono">{verifiedVote.voucher}</span></p>
                    <p><strong>Vote ID:</strong> {verifiedVote.id}</p>
                    <p><strong>Position ID:</strong> {verifiedVote.position_id}</p>
                    <p><strong>Candidate ID:</strong> {verifiedVote.candidate_id}</p>
                    <p className="text-xs text-gray-500 pt-3 border-t mt-3">
                        Your vote is anonymous. Candidate name is hidden for privacy.
                    </p>
                </div>
            )}

            <Button
                onClick={() => {
                    setSearchInput('');
                    setStatus('idle');
                    setErrorMessage('');
                    setVerifiedVote(null);
                }}
                className="w-full mt-6 min-h-touch rounded-btn"
            >
                Verify Another Vote
            </Button>
        </div>
    );

    return (
        <div className="min-h-[60vh] flex items-center justify-center py-8 px-4">
            <Card className="max-w-lg w-full p-6">
                {lockoutUntil && renderLockoutView()}
                {status === 'loading' && <div className="flex justify-center items-center h-40"><Spinner /></div>}
                {status === 'idle' && !lockoutUntil && renderIdle()}
                {status === 'verified' && renderResult(true)}
                {status === 'error' && !lockoutUntil && renderResult(false)}
            </Card>
        </div>
    );
};

export default VerificationPage;
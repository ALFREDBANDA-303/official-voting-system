// web/pages/VotingPage.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Page, Candidate, Position } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import sjbuApi from '../src/api/sjbuApi';
import useElectionSchedule from '../hooks/useElectionSchedule';

interface VoteSelection {
  [positionId: number]: number;
}

interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}

interface VotingPageProps {
  positions: PositionWithCandidates[];
  userVoucher: string;
  setPage: (page: Page) => void;
  setVerificationCode: (code: string) => void;
  isOffline: boolean;
}

const VotingPage: React.FC<VotingPageProps> = ({
  positions,
  userVoucher,
  setPage,
  setVerificationCode,
  isOffline,
}) => {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selections, setSelections] = useState<VoteSelection>({});
  const [view, setView] = useState<'voting' | 'review'>('voting');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isManifestoModalOpen, setIsManifestoModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalCandidate, setModalCandidate] = useState<Candidate | null>(null);

  const { schedule, phase, loading: scheduleLoading } = useElectionSchedule(10000);

  // Load saved selections
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dmi-vote-selections');
      if (saved) {
        const parsed = JSON.parse(saved);
        const numeric: VoteSelection = {};
        Object.keys(parsed).forEach(key => {
          const val = parsed[key];
          if (typeof val === 'number') {
            numeric[parseInt(key, 10)] = val;
          }
        });
        setSelections(numeric);
      }
    } catch (err) {
      console.error('Failed to load saved selections', err);
    }
  }, []);

  // Save selections
  useEffect(() => {
    try {
      localStorage.setItem('dmi-vote-selections', JSON.stringify(selections));
    } catch (err) {
      console.error('Failed to save selections', err);
    }
  }, [selections]);

  const currentPosition = positions[currentPositionIndex];

  const handleSelect = (candidateId: number) => {
    setSelections(prev => ({
      ...prev,
      [currentPosition.id]: candidateId,
    }));
  };

  const handleNext = () => {
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
    } else {
      if (Object.keys(selections).length < positions.length) {
        alert('Please select a candidate for all positions.');
        return;
      }
      setView('review');
    }
  };

  const handleBack = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1);
    }
  };

// UPDATED SUBMISSION HANDLER WITH PARTIAL VOTE SUPPORT
const handleSubmit = async () => {
  if (scheduleLoading) {
    alert('Please wait — election schedule is loading.');
    return;
  }
  if (phase !== 'LIVE') {
    alert('Voting is not currently open.');
    return;
  }
  if (isOffline) {
    alert('You are offline. Reconnect to submit your vote.');
    return;
  }
  if (Object.keys(selections).length !== positions.length) {
    alert('You must vote for both positions.');
    return;
  }

  setIsSubmitting(true);
  setIsConfirmModalOpen(false);

  try {
    // Identify positions
    const presidentPos = positions.find(p => p.name.toLowerCase().includes('president') && !p.name.toLowerCase().includes('vice'));
    const vicePos = positions.find(p => 
      p.name.toLowerCase().includes('vice') || 
      p.name.toLowerCase().includes('vp')
    );

    if (!presidentPos || !vicePos) {
      throw new Error('Could not identify President or Vice President position.');
    }

    const presidentCandidateId = selections[presidentPos.id];
    const vicePresidentCandidateId = selections[vicePos.id];

    if (!presidentCandidateId || !vicePresidentCandidateId) {
      alert('Please complete your ballot.');
      setIsSubmitting(false);
      return;
    }

    // Submit vote request
    const response = await sjbuApi.post('/vote', {
      voucher: userVoucher,
      presidentCandidateId,
      vicePresidentCandidateId,
    });

    // EXTRACT VERIFICATION CODE AND MESSAGE FROM BACKEND RESPONSE
    let verificationCode: string | null = null;
    let message: string = 'Your vote was recorded successfully!';

    const data = response.data?.data;

    // Try to extract verification code from various response structures
    if (data?.verificationCode) {
      verificationCode = data.verificationCode;
    } else if (data?.presidentVote?.verification_code) {
      verificationCode = data.presidentVote.verification_code;
    } else if (data?.vicePresidentVote?.verification_code) {
      verificationCode = data.vicePresidentVote.verification_code;
    } else if (data?.presidentVote?.verificationCode) {
      verificationCode = data.presidentVote.verificationCode;
    } else if (data?.vicePresidentVote?.verificationCode) {
      verificationCode = data.vicePresidentVote.verificationCode;
    }

    // Extract custom message if provided (for partial vote completion)
    if (data?.message) {
      message = data.message;
    }

    // Handle different response scenarios
    if (!verificationCode) {
      console.warn('Vote succeeded but no verification code found', response.data);
      alert('Your vote was recorded successfully, but no verification code was received. Contact an admin if needed.');
      localStorage.removeItem('dmi-vote-selections');
      setPage(Page.Home);
      return;
    }

    // Show appropriate success message
    if (message.includes('completed') || message.includes('adding')) {
      // This was a partial vote completion
      alert(`✓ ${message}\n\nYour verification code: ${verificationCode}`);
    }

    setVerificationCode(verificationCode);
    localStorage.removeItem('dmi-vote-selections');
    setPage(Page.VoteSuccess);

  } catch (err: any) {
    console.error('Submission failed:', err);

    let message = 'Failed to submit vote. Please try again.';

    // Handle specific error scenarios
    if (err.response?.status === 409) {
      const errorMsg = err.response?.data?.error || '';
      
      if (errorMsg.includes('already been used for both positions')) {
        message = '⚠️ You have already cast your complete vote for both positions. Your voucher cannot be used again.';
      } else if (errorMsg.includes('already voted for this position')) {
        message = '⚠️ You have already voted for this position. Please contact support if you believe this is an error.';
      } else {
        message = '⚠️ This voucher has already been used to vote.';
      }
    } else if (err.response?.status === 500) {
      const errorMsg = err.response?.data?.error || '';
      
      if (errorMsg.includes('Database corruption')) {
        message = '⚠️ There is an issue with your voting record. Please contact support immediately with your voucher code.';
      } else if (errorMsg) {
        message = errorMsg;
      }
    } else if (err.response?.data?.error) {
      message = err.response.data.error;
    } else if (err.message) {
      message = err.message;
    }

    alert(message);
  } finally {
    setIsSubmitting(false);
  }
};
  const openManifesto = (candidate: Candidate) => {
    setModalCandidate(candidate);
    setIsManifestoModalOpen(true);
  };

  // Loading & Phase Checks
  if (scheduleLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-4xl mx-auto p-6">
          <h2 className="text-xl font-bold text-dmi-blue-900">Loading schedule…</h2>
        </Card>
      </div>
    );
  }

  if (phase !== 'LIVE') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-4xl mx-auto p-6">
          <h2 className="text-xl font-bold">Voting is {phase === 'PRE' ? 'not yet open' : 'closed'}</h2>
        </Card>
      </div>
    );
  }

  if (!currentPosition) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-4xl mx-auto p-6">
          <h2 className="text-xl font-bold text-dmi-blue-900">Loading election data…</h2>
        </Card>
      </div>
    );
  }

  const renderVotingView = () => (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6 border-b">
        <p className="text-sm text-gray-500">Position {currentPositionIndex + 1} of {positions.length}</p>
        <h2 className="text-2xl font-bold text-dmi-blue-900">{currentPosition.name}</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div
            className="bg-dmi-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${((currentPositionIndex + 1) / positions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {currentPosition.candidates.map(candidate => (
          <div
            key={candidate.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selections[currentPosition.id] === candidate.id
                ? 'bg-dmi-blue-50 border-dmi-blue-500 ring-2 ring-dmi-blue-500'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSelect(candidate.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={candidate.imageUrl} alt={candidate.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h4 className="text-lg font-semibold text-dmi-blue-900">{candidate.name}</h4>
                  <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); openManifesto(candidate); }}>
                    View Manifesto
                  </Button>
                </div>
              </div>
              {selections[currentPosition.id] === candidate.id && (
                <svg className="w-8 h-8 text-dmi-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gray-50 flex justify-between">
        <Button variant="secondary" onClick={handleBack} disabled={currentPositionIndex === 0}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!selections[currentPosition.id]}>
          {currentPositionIndex < positions.length - 1 ? 'Next' : 'Review Ballot'}
        </Button>
      </div>
    </Card>
  );

  const renderReviewView = () => (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6 border-b text-center">
        <h2 className="text-2xl font-bold text-dmi-blue-900">Review Your Ballot</h2>
        <p className="text-gray-600 mt-2">Once submitted, your vote cannot be changed.</p>
      </div>

      <div className="p-6 space-y-4">
        {positions.map(pos => {
          const selected = pos.candidates.find(c => c.id === selections[pos.id]);
          return (
            <div key={pos.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-dmi-blue-800">{pos.name}</p>
                <p className="text-lg">{selected?.name || 'No selection'}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => {
                setCurrentPositionIndex(positions.findIndex(p => p.id === pos.id));
                setView('voting');
              }}>
                Change
              </Button>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-gray-50 flex justify-between">
        <Button variant="secondary" onClick={() => setView('voting')}>
          Back to Ballot
        </Button>
        <Button onClick={() => setIsConfirmModalOpen(true)} disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : 'Submit Ballot'}
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center p-3 z-50">
          Offline — your progress is saved. Reconnect to submit.
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {view === 'voting' && renderVotingView()}
        {view === 'review' && renderReviewView()}

        <Modal isOpen={isManifestoModalOpen} onClose={() => setIsManifestoModalOpen(false)} title="Manifesto">
          <p className="whitespace-pre-wrap">{modalCandidate?.manifesto}</p>
        </Modal>

        <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Submission">
          <div className="text-center">
            <p className="my-4">This action is final. Submit your vote?</p>
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : 'Yes, Submit Vote'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default VotingPage;
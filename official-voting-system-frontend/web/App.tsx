// web/App.tsx
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Page, Position, Candidate, AdminUser, ElectionStatus } from './types';
import { ELECTION_START_DATE, ELECTION_END_DATE } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthenticationPage from './pages/AuthenticationPage';
import VotingPage from './pages/VotingPage';
import VoteSuccessPage from './pages/VoteSuccessPage';
import VerificationPage from './pages/VerificationPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import OfficialResultsPage from './pages/OfficialResultsPage';
import LiveResultsPage from './pages/LiveResultsPage';
import WinnersPage from './pages/WinnersPage';
import IntroPage from './pages/IntroPage';
import CandidateGalleryPage from './pages/CandidateGalleryPage';
import HowToVotePage from './pages/HowToVotePage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactHelpPage from './pages/ContactHelpPage';
import MeetTheTeamPage from './pages/MeetTheTeamPage';
import WelcomeTeamModal from './components/WelcomeTeamModal'; // ← NEW
import Card from './components/Card';
import Button from './components/Button';
import { useAllPositions } from './hooks/useAllPositions';
import useElectionSchedule from './hooks/useElectionSchedule';
import sjbuApi from './src/api/sjbuApi';

interface PositionWithCandidates extends Position {
  candidates: Candidate[];
  totalVotes?: number;
  voterTurnout?: number;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Intro);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [userVoucher, setUserVoucher] = useState<string>('');

  // Welcome Modal State — shows only once per user
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const {
    positions: livePositions,
    isLoading: isPositionsLoading,
    error: positionsError,
    fetchPositions
  } = useAllPositions();

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [electionStatus, setElectionStatus] = useState<ElectionStatus>('PRE_ELECTION');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [electionStartDate, setElectionStartDate] = useState<Date>(ELECTION_START_DATE);
  const [electionEndDate, setElectionEndDate] = useState<Date>(ELECTION_END_DATE);

  const { schedule: appSchedule, phase: appPhase, loading: scheduleLoading, refresh: refreshSchedule } = useElectionSchedule(15000);

  const mapPhaseToElectionStatus = (phase: string | undefined): ElectionStatus => {
    switch (phase) {
      case 'PRE':
      case 'PRE_ELECTION':
        return 'PRE_ELECTION';
      case 'LIVE':
      case 'ACTIVE':
        return 'LIVE';
      case 'POST_WAIT':
      case 'POST':
      case 'POST_ELECTION':
      case 'COMPLETED':
        return 'POST_ELECTION';
      default:
        return 'PRE_ELECTION';
    }
  };

  useEffect(() => {
    if (!scheduleLoading) {
      setElectionStatus(mapPhaseToElectionStatus(appPhase));
      if (appSchedule) {
        try {
          if (appSchedule.startDate) setElectionStartDate(new Date(appSchedule.startDate));
          if (appSchedule.endDate) setElectionEndDate(new Date(appSchedule.endDate));
        } catch (err) {
          console.warn('Failed to parse server schedule dates', err);
        }
      }
    }
  }, [appPhase, appSchedule, scheduleLoading]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show Welcome Modal only once per user
  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenTeamWelcome');
    if (!hasSeen) {
      setShowWelcomeModal(true);
      localStorage.setItem('hasSeenTeamWelcome', 'true');
    }
  }, []);

  const handleUserLoginSuccess = (voucher: string) => {
    setUserVoucher(voucher);
    setCurrentPage(Page.Voting);
    fetchPositions();
  };

  const handleUserLogout = async () => {
    try {
      await sjbuApi.post('/logout');
      setUserVoucher('');
      setCurrentPage(Page.Home);
    } catch (error) {
      console.error('User logout failed:', error);
      setUserVoucher('');
      setCurrentPage(Page.Home);
    }
  };

  const handleStartCountdown = (hours: number) => {
    const now = new Date();
    const newStartDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const newEndDate = new Date(newStartDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    setElectionStartDate(newStartDate);
    setElectionEndDate(newEndDate);
  };

  const handleAdminLogin = (user: AdminUser) => {
    setCurrentUser(user);
    setCurrentPage(Page.Admin);
  };

  const handleAdminLogout = async () => {
    try {
      await sjbuApi.post('/admin/logout');
    } catch (error) {
      console.error('Admin logout failed:', error);
    } finally {
      setCurrentUser(null);
      setCurrentPage(Page.Home);
    }
  };

  const handleAdminRefetch = useCallback(() => {
    fetchPositions();
    refreshSchedule();
  }, [fetchPositions, refreshSchedule]);

  const renderResultsPage = () => {
    switch (electionStatus) {
      case 'LIVE':
        return <LiveResultsPage positions={livePositions as PositionWithCandidates[]} setPage={setCurrentPage} />;
      case 'POST_ELECTION':
        return (
          <OfficialResultsPage 
            positions={livePositions as PositionWithCandidates[]} 
            setPage={setCurrentPage}
            schedule={appSchedule}
            scheduleLoading={scheduleLoading}
          />
        );
      case 'PRE_ELECTION':
        return (
          <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
            <Card className="max-w-2xl mx-auto p-12 text-center">
              <h2 className="text-3xl font-bold text-dmi-blue-900">The Election Has Not Started</h2>
              <p className="text-gray-600 mt-4">The voting period has not yet begun. Please check back on the official start date. Results will be available here once the election is live.</p>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPage = () => {
    const isError = positionsError;
    const isLoadingData = isPositionsLoading;

    if (isLoadingData) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <h2 className="text-3xl font-bold text-dmi-blue-900">Loading Election Data...</h2>
            <p className="text-gray-600 mt-4">Please wait while we fetch the latest positions and candidates from the server.</p>
          </Card>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
          <Card className="max-w-2xl mx-auto p-12 text-center bg-red-50 border-red-400">
            <h2 className="text-3xl font-bold text-red-700">Error Loading Election Data</h2>
            <p className="text-red-600 mt-4">{isError}</p>
            <Button onClick={fetchPositions} className="mt-6">Try Again</Button>
          </Card>
        </div>
      );
    }

    switch (currentPage) {
      case Page.Intro:
        return <IntroPage setPage={setCurrentPage} />;
      case Page.Home:
        return <HomePage setPage={setCurrentPage} electionStatus={electionStatus} electionStartDate={electionStartDate} electionEndDate={electionEndDate} />;
      case Page.Authentication:
        return <AuthenticationPage onLoginSuccess={handleUserLoginSuccess} setPage={setCurrentPage} electionStatus={electionStatus} electionStartDate={electionStartDate} electionEndDate={electionEndDate} />;
      case Page.Voting:
        return <VotingPage positions={livePositions as PositionWithCandidates[]} userVoucher={userVoucher} setPage={setCurrentPage} setVerificationCode={setVerificationCode} isOffline={isOffline} />;
      case Page.VoteSuccess:
        return <VoteSuccessPage verificationCode={verificationCode} setPage={setCurrentPage} />;
      case Page.Verification:
        return <VerificationPage />;
      case Page.Results:
        return renderResultsPage();
      case Page.Winners:
        return <WinnersPage electionStatus={electionStatus} />;
      case Page.CandidateGallery:
        return <CandidateGalleryPage />;
      case Page.HowToVote:
        return <HowToVotePage />;
      case Page.TermsOfUse:
        return <TermsOfUsePage />;
      case Page.MeetTheTeam:
        return <MeetTheTeamPage />;
      case Page.PrivacyPolicy:
        return <PrivacyPolicyPage />;
      case Page.ContactHelp:
        return <ContactHelpPage />;
      case Page.Admin:
        if (!currentUser) {
          return <AdminLoginPage onLoginSuccess={handleAdminLogin} />;
        }
        return <AdminDashboard currentUser={currentUser} setCurrentUser={setCurrentUser} onLogout={handleAdminLogout} onStartCountdown={handleStartCountdown} onRefetchPositions={handleAdminRefetch} />;
      default:
        return <HomePage setPage={setCurrentPage} electionStatus={electionStatus} electionStartDate={electionStartDate} electionEndDate={electionEndDate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {currentPage !== Page.Intro && <Header setPage={setCurrentPage} isOffline={isOffline} />}
      <main className="flex-grow">
        {renderPage()}
      </main>
      {currentPage !== Page.Intro && <Footer setPage={setCurrentPage} />}

      {/* Welcome Modal — appears once per user */}
      <WelcomeTeamModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onGoToTeam={() => {
          setShowWelcomeModal(false);
          setCurrentPage(Page.MeetTheTeam);
        }}
      />
    </div>
  );
};

export default App;
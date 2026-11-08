// web/pages/AuthenticationPage.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Page, ElectionStatus } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import CountdownTimer from '../components/CountdownTimer';
import sjbuApi from '../src/api/sjbuApi'; 
import { isAxiosError } from 'axios';

interface AuthenticationPageProps {
  onLoginSuccess: (voucher: string) => void; 
  setPage: (page: Page) => void;
  electionStatus: ElectionStatus;
  electionStartDate: Date;
  electionEndDate: Date;
}

const AuthenticationPage: React.FC<AuthenticationPageProps> = ({ 
  onLoginSuccess, 
  setPage, 
  electionStatus, 
  electionStartDate, 
  electionEndDate 
}) => {
  const [voucher, setVoucher] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleVerifyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    try {
        const response = await sjbuApi.post('/login', { voucher });
        
        if (response.status === 200) {
            setIsSuccess(true);
            onLoginSuccess(voucher); 
        } else {
            setError('Verification failed with an unexpected response.');
        }

    } catch (err) {
        let errorReason = 'An error occurred during verification. Please try again.';

        if (isAxiosError(err) && err.response) {
            const status = err.response.status;
            
            if (status === 401 || status === 400) {
                errorReason = err.response.data.error || 'Invalid voucher code.';
            } else if (status === 429) {
                errorReason = 'Too many requests. Please try again shortly.';
            }
        }
        
        setError(errorReason);

    } finally {
        setIsLoading(false);
        setVoucher('');
    }
  };

  const renderSuccessView = () => (
    <div className="p-6 text-center flex flex-col items-center justify-center h-full">
        <svg className="w-20 h-20 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="text-xl lg:text-2xl font-semibold text-dmi-blue-900">Authentication Successful!</h3>
        <p className="text-gray-600 mt-2 text-base-mobile">You are verified. Loading your ballot now...</p>
    </div>
  );

  const renderVoucherView = () => (
    <form onSubmit={handleVerifyVoucher}>
      <div className="p-6 text-center">
        <h3 className="text-lg lg:text-xl font-semibold text-dmi-blue-900">Voter Authentication</h3>
        <p className="text-gray-600 mt-2 text-sm">Please enter your unique voting voucher code below to proceed.</p>
        <div className="my-4">
          <input
            type="text"
            value={voucher}
            onChange={(e) => setVoucher(e.target.value)}
            className="w-full text-center text-xl-mobile md:text-2xl font-mono bg-gray-100 border-2 border-gray-300 rounded-card p-3 focus:outline-none focus:shadow-focus-ring focus:border-dmi-blue-500 text-dmi-blue-900 font-semibold placeholder-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
            placeholder="ENTER VOUCHER"
            required
            autoFocus
            disabled={isLoading}
          />
           <p className="text-xs text-gray-500 mt-2">(Enter your unique voting code)</p>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      </div>
      <div className="bg-gray-50 px-4 py-4">
        <Button 
          type="submit" 
          className="w-full min-h-touch rounded-btn bg-dmi-blue-500 text-white text-base-mobile font-semibold" 
          disabled={isLoading}
        >
           {isLoading ? <Spinner/> : (
             <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>
           )}
          {isLoading ? 'Verifying...' : 'Verify & Proceed'}
        </Button>
      </div>
    </form>
  );

  const renderPageContent = () => {
    switch (electionStatus) {
      case 'PRE_ELECTION':
        return (
          <Card className="max-w-2xl mx-auto p-8 text-center bg-dmi-blue-800 text-white">
            <h2 className="text-2xl lg:text-3xl font-bold">The Election Has Not Started Yet</h2>
            <p className="mt-4 mb-8 text-sm">Please check back when the countdown finishes. You will be able to cast your vote then.</p>
            <CountdownTimer 
              targetDate={electionStartDate} 
              title="Voting Begins In" 
              onCompleteMessage="The Election is Now Live!" 
            />
          </Card>
        );
      case 'POST_ELECTION':
        return (
          <Card className="max-w-md w-full p-8 text-center">
            <h2 className="text-2xl font-bold text-dmi-blue-900">Voting Has Ended</h2>
            <p className="text-gray-600 mt-4 text-sm">
              The voting period for the 2025 Student Elections is now closed. Thank you for your participation.
            </p>
            <Button className="mt-4" onClick={() => setPage(Page.Results)}>
              View Official Results
            </Button>
          </Card>
        );
      case 'LIVE':
        return (
          <div className="w-full max-w-md space-y-6">
              <div className="p-3 bg-dmi-blue-700 rounded-xl">
                  <CountdownTimer 
                    targetDate={electionEndDate} 
                    title="Voting Closes In" 
                    onCompleteMessage="Voting has ended." 
                  />
              </div>
              <Card>
                  {isSuccess ? renderSuccessView() : renderVoucherView()}
              </Card>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8 px-4">
        {renderPageContent()}
    </div>
  );
};

export default AuthenticationPage;
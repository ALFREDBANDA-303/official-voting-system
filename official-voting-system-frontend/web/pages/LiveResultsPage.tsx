import * as React from 'react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Position, Page } from '../types';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { useLiveStatsPolling } from '../hooks/useLiveStatsPolling';
import { useVotingTrends } from '../hooks/useVotingTrends';

interface LiveResultsPageProps {
  positions: Position[];
  setPage: (page: Page) => void;
}

const LiveIndicator = () => (
  <span className="relative flex h-3 w-3 ml-2" aria-hidden>
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
  </span>
);

const LiveResultsPage: React.FC<LiveResultsPageProps> = ({ positions, setPage }) => {
  const { stats, isLoading: isStatsLoading, error: statsError } = useLiveStatsPolling();
  const { hourlyTrends, isLoading: isTrendsLoading, error: trendsError } = useVotingTrends();

  const isLoading = isStatsLoading || isTrendsLoading;
  const error = statsError || trendsError;

  if (isLoading && !stats) {
    return (
      <div className="container px-4 py-8 text-center min-h-[60vh] flex items-center justify-center">
         <Spinner /> <p className="ml-4 text-dmi-blue-800 font-medium text-base-mobile">Loading live results...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="container px-4 py-8 text-center min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-2xl mx-auto p-6 text-center bg-red-50 border-red-400">
              <h2 className="text-2xl font-bold text-red-700">Live Results Error</h2>
              <p className="text-red-600 mt-3 text-sm">{error}</p>
          </Card>
       </div>
    );
  }

  const totalVotesCastRaw = Number(stats?.totalVotesCast ?? 0);
  const totalVotersRaw = Number(stats?.totalVoters ?? 0);

  // UI-facing aggregate adjusted
  const displayedVotes = Math.round(totalVotesCastRaw / 2);
  const displayedVoters = totalVotersRaw;

  const turnoutPercent = (() => {
    if (displayedVoters <= 0) return '0.00';
    const pct = (displayedVotes / displayedVoters) * 100;
    const clamped = Math.max(0, Math.min(pct, 100));
    return clamped.toFixed(2);
  })();

  const positionsWithStats = stats?.positionsWithStats || [];

  return (
    <div className="container px-4 py-6">
      <div className="text-center mb-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dmi-blue-900">Live Election Tracker</h1>
              {isLoading ? <span className="text-sm text-gray-500">(Polling...)</span> : <LiveIndicator />}
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-2">The election is currently in progress. Watch the numbers update in real-time!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
              <h3 className="text-sm font-semibold text-gray-500">Live Votes Cast</h3>
              <p className="text-3xl sm:text-4xl font-bold text-dmi-blue-800 transition-all duration-300">{displayedVotes}</p>
          </Card>

          <Card className="p-4 text-center">
              <h3 className="text-sm font-semibold text-gray-500">Registered Voters</h3>
              <p className="text-3xl sm:text-4xl font-bold text-dmi-blue-800">{displayedVoters}</p>
          </Card>

          <Card className="p-4 text-center">
              <h3 className="text-sm font-semibold text-gray-500">Live Voter Turnout</h3>
              <p className="text-3xl sm:text-4xl font-bold text-dmi-blue-800 transition-all duration-300">{turnoutPercent}%</p>
          </Card>
      </div>

      <div className="mb-6">



        <h2 className="text-xl sm:text-2xl font-bold text-dmi-blue-900 text-center mb-4">Candidate Race Summaries</h2>
        <div className="space-y-6">
          {positionsWithStats.map((position: any) => {
            const rawTotalVotes = Number(position.totalVotes ?? 0);
            const candidates = (position.candidates || []).map((c: any) => ({ ...c }));
            
            // Sort candidates by vote count (descending)
            const sortedCandidates = [...candidates].sort((a, b) => 
              (Number(b.voteCount) || 0) - (Number(a.voteCount) || 0)
            );

            return (
              <Card key={position.positionId} className="p-4">
                <h3 className="text-lg font-bold text-dmi-blue-900 mb-3">
                  {position.positionName} - {rawTotalVotes} Votes Cast
                </h3>

                <div className="h-48 sm:h-56 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={candidates} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="candidateName" width={110} tick={{fontSize: 12}} />
                      <Tooltip formatter={(value: number, _name: string, props: any) => {
                        const raw = Number(props.payload.voteCount ?? value);
                        const pct = raw && rawTotalVotes ? ((raw / rawTotalVotes) * 100).toFixed(2) : '0.00';
                        return [`${raw} raw — ${pct}%`, position.positionName];
                      }} />
                      <Legend />
                      <Bar dataKey="voteCount" name="Votes" fill="#1b66c4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sortedCandidates.map((candidate: any, index: number) => {
                    const voteCount = Number(candidate.voteCount || 0);
                    const percentage = rawTotalVotes > 0 
                      ? ((voteCount / rawTotalVotes) * 100).toFixed(2) 
                      : '0.00';
                    const isLeading = index === 0 && voteCount > 0;
                    const isSecond = index === 1 && voteCount > 0;

                    // Determine card styling based on rank
                    let borderColor = 'border-gray-300';
                    let bgColor = 'bg-white';
                    let badgeColor = 'bg-gray-200 text-gray-700';
                    let rankBadge = `#${index + 1}`;

                    if (isLeading) {
                      borderColor = 'border-green-400';
                      bgColor = 'bg-green-50';
                      badgeColor = 'bg-green-500 text-white';
                      rankBadge = '🥇 Leading';
                    } else if (isSecond) {
                      borderColor = 'border-blue-400';
                      bgColor = 'bg-blue-50';
                      badgeColor = 'bg-blue-500 text-white';
                      rankBadge = '🥈 2nd';
                    }

                    return (
                      <div 
                        key={candidate.candidateId}
                        className={`${bgColor} border-2 ${borderColor} rounded-lg p-3 transition-all duration-300 hover:shadow-md`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-bold text-sm ${isLeading ? 'text-green-900' : isSecond ? 'text-blue-900' : 'text-gray-800'}`}>
                            {candidate.candidateName}
                          </h4>
                          <span className={`${badgeColor} text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2`}>
                            {rankBadge}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs text-gray-600">Votes:</span>
                            <span className={`text-xl font-bold tabular-nums ${isLeading ? 'text-green-700' : isSecond ? 'text-blue-700' : 'text-gray-800'}`}>
                              {voteCount.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs text-gray-600">Share:</span>
                            <span className={`text-lg font-semibold tabular-nums ${isLeading ? 'text-green-700' : isSecond ? 'text-blue-700' : 'text-gray-700'}`}>
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveResultsPage;
import * as React from 'react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Position, Page } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner'; 
import { useOverallStats } from '../hooks/useOverallStats';

interface ResultsPageProps {
    positions: Position[]; 
    setPage: (page: Page) => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ setPage }) => {
        const { stats, isLoading, error } = useOverallStats();

        if (isLoading) {
                return (
                        <div className="container px-4 py-8 text-center min-h-[60vh] flex items-center justify-center">
                                        <Spinner /> <p className="ml-4 text-dmi-blue-800 font-medium text-base-mobile">Loading election statistics...</p>
                                </div>
                        );
                }

        if (error) {
                return <div className="container px-4 py-8 text-center text-red-500">Error: {error}</div>;
        }

        if (!stats) {
                return <div className="container px-4 py-8 text-center text-gray-500">No results data available.</div>;
        }

        const totalVotes = stats.totalVotesCast;
        const eligibleVoters = stats.totalVoters;
        const turnoutPercentage = eligibleVoters > 0 ? (totalVotes / eligibleVoters) * 100 : 0;
        
        const overallTurnoutData = [
            { name: 'Voted', value: totalVotes },
            { name: 'Remaining', value: Math.max(0, eligibleVoters - totalVotes) },
        ];


        return (
                <div className="container px-4 py-6">
                        <h1 className="text-xl sm:text-2xl font-semibold text-dmi-blue-900 mb-4 text-center">Election Results</h1>

                        {/* Overall Turnout */}
                        <Card title="Overall Turnout" className="mb-4">
                                <div className="flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={overallTurnoutData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="value" fill="#8884d8" />
                                                </BarChart>
                                        </ResponsiveContainer>
                                </div>
                                <div className="text-center mt-3">
                                        <p className="text-gray-600 text-sm">
                                                Total Votes: {totalVotes} / {eligibleVoters}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                                Turnout Percentage: {turnoutPercentage.toFixed(2)}%
                                        </p>
                                </div>
                        </Card>

                        {/* Results by Position */}
                        {stats.positionsWithStats.map((positionStats) => {
                                const candidateData = positionStats.candidates.map((candidate) => ({
                                    name: candidate.candidateName,
                                    votes: candidate.voteCount || 0,
                                }));

                                return (
                                        <Card key={positionStats.positionId} title={positionStats.positionName} className="mb-4">
                                                <div style={{ width: '100%', height: 220 }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={candidateData}>
                                                                        <CartesianGrid strokeDasharray="3 3" />
                                                                        <XAxis dataKey="name" />
                                                                        <YAxis />
                                                                        <Tooltip />
                                                                        <Legend />
                                                                        <Bar dataKey="votes" fill="#82ca9d" />
                                                                </BarChart>
                                                        </ResponsiveContainer>
                                                </div>
                                                <div className="mt-3 text-center">
                                                    <p className="text-sm text-gray-600">Total votes for this position: {positionStats.totalVotes}</p>
                                                </div>
                                        </Card>
                                );
                        })}

                        <div className="mt-6 flex justify-center">
                                <Button onClick={() => setPage(Page.Home)} variant="secondary" className="w-full sm:w-auto">Back to Home</Button>
                        </div>
                </div>
        );
};

export default ResultsPage;

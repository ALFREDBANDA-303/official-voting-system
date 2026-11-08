// web/pages/AdminDashboard.tsx

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Position, Candidate, AdminUser, AuditLogEntry, AdminRole } from '../types';
import { usePermissions, Permissions } from '../hooks/usePermissions';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';
import Spinner from '../components/Spinner'; 
import sjbuApi from '../src/api/sjbuApi';
import { useAdminUsers } from '../hooks/useAdminUsers'; 
import { useOverallStats } from '../hooks/useOverallStats'; 
import { useAuditLogs } from '../hooks/useAuditLogs'; 
import { isAxiosError } from 'axios';
import { useVotingTrends } from '../hooks/useVotingTrends'; 
import { useAllPositions } from '../hooks/useAllPositions'; 

// New imports for schedule editor
import useElectionSchedule from '../hooks/useElectionSchedule';
import { updateSchedule } from '../src/api/sjbuApi';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const UserIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7"/></svg>;
const PositionsIcon = () => <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>;
const CandidatesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M16 22a4 4 0 0 0-8 0"/><circle cx="12" cy="15" r="3"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>;
const AuditIcon = () => <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 10v4h4"/><path d="m11 14 1.535-1.605a5 5 0 0 1 8 1.5"/><path d="M16 2v4"/><path d="m21 18-1.535 1.605a5 5 0 0 1-8-1.5"/><path d="M21 22v-4h-4"/><path d="M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4.3"/><path d="M3 10h4"/><path d="M8 2v4"/></svg>;

// --- Types and component code unchanged except where schedule integration added ---

interface PositionWithCandidates extends Position {
    candidates: Candidate[];
}

interface AdminDashboardProps {
    currentUser: AdminUser;
    setCurrentUser: (user: AdminUser) => void;
    onLogout: () => void;
    onStartCountdown: (hours: number) => void;
    onRefetchPositions: () => void;
}

type AdminView = 'dashboard' | 'positions' | 'candidates' | 'users' | 'audit' | 'settings';
type ModalType = 'ADD_POSITION' | 'EDIT_POSITION' | 'DELETE_POSITION' | 'ADD_CANDIDATE' | 'EDIT_CANDIDATE' | 'DELETE_CANDIDATE' | 'ADD_USER' | 'EDIT_USER' | 'DELETE_USER';
interface ModalState {
    isOpen: boolean;
    type: ModalType | null;
    data?: any;
}

const RoleSwitcher: React.FC<{ adminUsers: AdminUser[], currentUser: AdminUser, setCurrentUser: (user: AdminUser) => void, onLogout: () => void }> = ({ adminUsers, currentUser, setCurrentUser, onLogout }) => {
    return (
        <Card className="mb-4 p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center flex-wrap gap-2">
                    <UserIcon />
                    <span className="font-semibold text-dmi-blue-900">Current User:</span>
                    <span className="ml-2 px-2 py-1 text-sm font-semibold text-dmi-blue-800 bg-dmi-blue-100 rounded-full">{currentUser.username}</span>
                    <span className="px-2 py-1 text-sm font-bold text-white bg-dmi-blue-700 rounded-full">{currentUser.role.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button size="sm" variant="secondary" onClick={onLogout} className="min-h-touch">
                        <LogoutIcon/> Logout
                    </Button>
                </div>
            </div>
        </Card>
    );
};

const Sidebar: React.FC<{ activeView: AdminView; setActiveView: (view: AdminView) => void; permissions: Permissions; }> = ({ activeView, setActiveView, permissions }) => {
     const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, permitted: permissions.canViewDashboard },
        { id: 'positions', label: 'Positions', icon: <PositionsIcon />, permitted: permissions.canViewPositions },
        { id: 'candidates', label: 'Candidates', icon: <CandidatesIcon />, permitted: permissions.canViewCandidates },
        { id: 'users', label: 'User Management', icon: <UsersIcon />, permitted: permissions.canViewUsers },
        { id: 'audit', label: 'Audit Log', icon: <AuditIcon />, permitted: permissions.canViewAuditLog },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon />, permitted: permissions.canEditSettings },
    ];

    return (
        <aside className="w-full lg:w-auto">
            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible bg-white p-2 rounded-lg shadow-sm">
                {navItems.map(item => {
                    if (!item.permitted) return null;
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id as AdminView)}
                            className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-md transition-colors text-sm ${isActive ? 'bg-dmi-blue-600 text-white font-semibold shadow' : 'text-gray-700 hover:bg-dmi-blue-50 hover:text-dmi-blue-800'}`}
                        >
                            {item.icon}
                            <span className="hidden sm:inline">{item.label}</span>
                        </button>
                    )
                })}
            </nav>
        </aside>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { currentUser, onLogout, onRefetchPositions } = props;
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null });
    const permissions = usePermissions(currentUser);

    const { adminUsers, isLoading: isAdminUsersLoading, error: adminUsersError, fetchAdminUsers } = useAdminUsers();
    const { positions, isLoading: isPositionsLoading, error: positionsError, fetchPositions } = useAllPositions();

    const { schedule, phase: schedulePhase, loading: scheduleLoading, refresh: refreshSchedule } = useElectionSchedule(15000);

    const handleOpenModal = (type: ModalType, data?: any) => setModal({ isOpen: true, type, data });
    const handleCloseModal = () => setModal({ isOpen: false, type: null });
    
    useEffect(() => {
        const viewPermissions: { [key in AdminView]: keyof Permissions } = {
            dashboard: 'canViewDashboard',
            positions: 'canViewPositions',
            candidates: 'canViewCandidates',
            users: 'canViewUsers',
            audit: 'canViewAuditLog',
            settings: 'canEditSettings',
        };

        if (!permissions[viewPermissions[activeView]]) {
            setActiveView('dashboard');
        }
    }, [currentUser, activeView, permissions]);

    const handleDataRefresh = useCallback(() => {
        fetchAdminUsers();
        fetchPositions();
        refreshSchedule();
    }, [fetchAdminUsers, fetchPositions, refreshSchedule]);
    
    useEffect(() => {
        if (onRefetchPositions) {
            (onRefetchPositions as any).refetch = fetchPositions; 
        }
    }, [fetchPositions, onRefetchPositions]);

    const renderActiveView = () => {
        if (isPositionsLoading && (activeView === 'positions' || activeView === 'candidates')) {
            return <Card className="p-6 text-center"><Spinner /><p className="mt-2 text-sm">Loading Positions/Candidates...</p></Card>
        }
        if (positionsError && (activeView === 'positions' || activeView === 'candidates')) {
            return <Card className="p-6 text-center text-red-600"><p>{positionsError}</p><Button onClick={fetchPositions} className="mt-3">Retry</Button></Card>
        }
        
        switch (activeView) {
            case 'dashboard': return <DashboardView permissions={permissions} />;
            case 'positions': return <PositionsView positions={positions} permissions={permissions} onOpenModal={handleOpenModal} />;
            case 'candidates': return <CandidatesView positions={positions} permissions={permissions} onOpenModal={handleOpenModal} />;
            case 'users': 
                 if (isAdminUsersLoading) return <Card className="p-6 text-center"><Spinner /><p className="mt-2 text-sm">Loading Admin Users...</p></Card>
                 if (adminUsersError && adminUsers.length === 0) return <Card className="p-6 text-center text-red-600"><p>{adminUsersError}</p><Button onClick={fetchAdminUsers}>Retry</Button></Card>
                 return <UserManagementView adminUsers={adminUsers} permissions={permissions} onOpenModal={handleOpenModal} onRefresh={handleDataRefresh} />;
            case 'audit': return <AuditLogView permissions={permissions} currentUser={currentUser} />;
            case 'settings': return <SettingsView permissions={permissions} onStartCountdown={props.onStartCountdown} />;
            default: return <DashboardView permissions={permissions} />;
        }
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-dmi-blue-900 mb-4">Administrator Dashboard</h1>
            
            <RoleSwitcher 
                adminUsers={adminUsers} 
                currentUser={props.currentUser} 
                setCurrentUser={props.setCurrentUser} 
                onLogout={onLogout}
            /> 

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3">
                   <Sidebar activeView={activeView} setActiveView={setActiveView} permissions={permissions} />
                </div>
                <div className="lg:col-span-9">
                   {renderActiveView()}
                </div>
            </div>
        
            <ManagementModals 
                modalState={modal} 
                onClose={handleCloseModal} 
                permissions={permissions} 
                positions={positions} 
                onRefreshData={handleDataRefresh}
                currentUser={currentUser}
            />
        </div>
    );
};

// DashboardView - UPDATED WITH CARD LAYOUT
interface DashboardViewProps {
    permissions: Permissions;
}
const DashboardView: React.FC<DashboardViewProps> = ({ permissions }) => {
    const { stats, isLoading, error, fetchStats } = useOverallStats();
    const { hourlyTrends: hourlyTurnout, isLoading: isTrendsLoading, error: trendsError, fetchTrends } = useVotingTrends(); 

    if (isLoading || isTrendsLoading) return <Card className="p-6 text-center"><Spinner /><p className="mt-2 text-sm">Loading Statistics...</p></Card>
    if (error || trendsError) return <Card className="p-6 text-center text-red-600"><p>{error || trendsError}</p><Button onClick={() => { fetchStats(); fetchTrends(); }} className="mt-3">Retry</Button></Card>
    
    const totalVotesCast = stats?.totalVotesCast ?? 0;
    const totalVoters = stats?.totalVoters ?? 0;
    
    const uniqueVotersProxy = totalVotesCast / 2;
    const liveVoterTurnout = (totalVoters > 0 && uniqueVotersProxy > 0)
        ? ((uniqueVotersProxy / totalVoters) * 100).toFixed(2)
        : '0.00';

    const positionsWithStats = stats?.positionsWithStats || [];
    const isReadOnly = !permissions.canManagePositions && !permissions.canManageCandidates;

    return (
        <div className="space-y-6">
            {isReadOnly && (
                <Card className="p-3 bg-blue-50 border-blue-200">
                    <p className="text-blue-800 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                        </svg>
                        <strong>Read-Only Access:</strong> You are viewing this dashboard in read-only mode as a Moderator.
                    </p>
                </Card>
            )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                    <h3 className="text-sm font-semibold text-gray-500">Total Votes Cast (Live)</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-dmi-blue-800 mt-2">{totalVotesCast}</p>
                </Card>
                 <Card className="p-4">
                    <h3 className="text-sm font-semibold text-gray-500">Voter Turnout (Live)</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-dmi-blue-800 mt-2">{liveVoterTurnout}%</p>
                </Card>
            </div>

            <Card className="p-4">
                <h2 className="text-lg font-bold text-dmi-blue-900 mb-3">Turnout by Hour</h2>
                {hourlyTurnout.length > 0 ? (
                    <div className="h-56 sm:h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyTurnout} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="votes" fill="#1b66c4" name="Votes Cast" /> 
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        No hourly trend data available from the server.
                    </div>
                )}
            </Card>

            <h2 className="text-xl font-bold text-dmi-blue-900 text-center mb-2">Candidate Race Summaries</h2>
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
                            <h3 className="text-lg font-bold text-dmi-blue-900 mb-3">{position.positionName} - {rawTotalVotes} Votes Cast</h3>
                            
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
    );
};

// SettingsView (modified to include server-driven schedule editor)
interface SettingsViewProps {
    permissions: Permissions;
    onStartCountdown: (hours: number) => void;
}
const SettingsView: React.FC<SettingsViewProps> = ({ permissions, onStartCountdown }) => {
    const { schedule, phase, loading: scheduleLoading, refresh } = useElectionSchedule(30000);
    const [startInput, setStartInput] = useState('');
    const [endInput, setEndInput] = useState('');
    const [resultsInput, setResultsInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        if (schedule) {
            setStartInput(schedule.startDate ?? '');
            setEndInput(schedule.endDate ?? '');
            setResultsInput(schedule.resultsAnnouncement ?? '');
        }
    }, [schedule]);

    const handleSaveSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!permissions.canEditSettings) return;
        setSaving(true);
        setMsg(null);
        try {
            await updateSchedule({
                startDate: new Date(startInput).toISOString(),
                endDate: new Date(endInput).toISOString(),
                resultsAnnouncement: resultsInput ? new Date(resultsInput).toISOString() : null
            });
            setMsg('Schedule saved');
            await refresh();
        } catch (err: any) {
            console.error(err);
            setMsg(err?.response?.data?.error || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-dmi-blue-900">Election Settings</h2>
                <p className="text-sm text-gray-500">Configure core parameters for the election.</p>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-4 space-y-4">
                {!permissions.canEditSettings && (
                    <div className="bg-dmi-blue-50 text-dmi-blue-800 p-2 rounded-lg text-sm">Settings can only be modified by a Super Admin.</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Election Start Date (UTC)</label>
                        <input type="datetime-local" value={startInput ? startInput.replace('Z','') : ''} onChange={e => setStartInput(new Date(e.target.value).toISOString())} disabled={!permissions.canEditSettings} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500 disabled:bg-gray-100" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Election End Date (UTC)</label>
                        <input type="datetime-local" value={endInput ? endInput.replace('Z','') : ''} onChange={e => setEndInput(new Date(e.target.value).toISOString())} disabled={!permissions.canEditSettings} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500 disabled:bg-gray-100" />
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700">Results Announcement (UTC, optional)</label>
                    <input type="datetime-local" value={resultsInput ? resultsInput.replace('Z','') : ''} onChange={e => setResultsInput(new Date(e.target.value).toISOString())} disabled={!permissions.canEditSettings} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500 disabled:bg-gray-100" />
                </div>

                 <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={!permissions.canEditSettings || saving} className="min-h-touch">{saving ? 'Saving...' : 'Save Schedule'}</Button>
                </div>
            </form>

            <div className="p-4 border-t space-y-3 text-sm text-gray-600">
                <p>Server schedule: {schedule ? `${schedule.startDate ?? '—'} → ${schedule.endDate ?? '—'}` : (scheduleLoading ? 'Loading...' : 'Not configured')}</p>
                {msg && <p className="text-sm text-gray-700">{msg}</p>}
            </div>
        </Card>
    );
};

// AuditLogView
interface AuditLogViewProps {
    permissions: Permissions;
    currentUser: AdminUser;
}
const AuditLogView: React.FC<AuditLogViewProps> = ({ permissions, currentUser }) => {
    const { logs, isLoading, error, fetchLogs } = useAuditLogs(); 
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage] = useState(20);

    const filteredLogs = logs.filter(log =>
        log.adminUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getActionChipColor = (action: string) => {
        if (action.includes('SUCCESS') || action.includes('CREATED') || action.includes('LOGIN')) return 'bg-green-100 text-green-800';
        if (action.includes('FAILED') || action.includes('DELETED')) return 'bg-red-100 text-red-800';
        if (action.includes('UPDATED') || action.includes('CHANGED') || action.includes('VIEW')) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    const isReadOnly = currentUser.role === 'moderator';

    return (
        <Card>
            <div className="p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b gap-3">
                <div>
                    <h2 className="text-lg font-bold text-dmi-blue-900">Admin Audit Log</h2>
                    {isReadOnly && (
                        <p className="text-sm text-blue-600 mt-1">
                            <strong>Read-Only Access:</strong> Viewing logs as Moderator
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Showing {filteredLogs.length > 0 ? indexOfFirstLog + 1 : 0} - {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-dmi-blue-500 focus:border-dmi-blue-500 text-sm"
                        aria-label="Search audit logs"
                    />
                    <Button size="sm" variant="secondary" onClick={() => fetchLogs()} disabled={isLoading} className="min-h-touch">
                        {isLoading ? <Spinner /> : <RefreshIcon />} <span className="hidden sm:inline ml-1">Refresh</span>
                    </Button>
                </div>
            </div>
            
            {isLoading && (
                <div className="p-4 text-center">
                    <Spinner />
                    <p className="mt-2 text-sm text-gray-600">Loading audit logs...</p>
                </div>
            )}
            
            {error && !isLoading && (
                <div className="p-4 text-center">
                    <div className="text-red-600 mb-3">
                        <p className="font-semibold">Error Loading Logs</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <Button onClick={() => fetchLogs()}>Retry</Button>
                </div>
            )}

            {!isLoading && !error && (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                                <tr>
                                    <th scope="col" className="px-3 py-2">Timestamp</th>
                                    <th scope="col" className="px-3 py-2">Admin User</th>
                                    <th scope="col" className="px-3 py-2">Action</th>
                                    <th scope="col" className="px-3 py-2">Details</th>
                                    <th scope="col" className="px-3 py-2">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLogs.map(log => (
                                    <tr key={log.id} className="border-b hover:bg-gray-50">
                                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{log.timestamp instanceof Date ? log.timestamp.toLocaleString() : log.timestamp}</td>
                                        <td className="px-3 py-2 font-medium text-dmi-blue-800">{log.adminUsername}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-1 font-semibold rounded-full text-xs ${getActionChipColor(log.action)}`}>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">{log.details}</td>
                                        <td className="px-3 py-2 font-mono text-gray-500">{log.ipAddress}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredLogs.length === 0 && (
                            <div className="text-center p-6 text-gray-500">
                                <p>No audit logs found matching your search criteria.</p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="p-3 flex flex-col sm:flex-row items-center justify-between border-t gap-2">
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="secondary" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>← Prev</Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-2 py-1 text-xs rounded ${currentPage === pageNum ? 'bg-dmi-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="secondary" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next →</Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};

// PositionsView
interface PositionsViewProps {
    positions: PositionWithCandidates[];
    permissions: Permissions;
    onOpenModal: (type: ModalType, data?: any) => void;
}
const PositionsView: React.FC<PositionsViewProps> = ({ positions, permissions, onOpenModal }) => {
    return (
    <Card>
        <div className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-3">
             <h2 className="text-lg font-bold text-dmi-blue-900">Manage Positions</h2>
            <Button 
                onClick={() => onOpenModal('ADD_POSITION')}
                disabled={!permissions.canManagePositions}
                disabledTooltip="Requires Admin or Super Admin role."
                className="min-h-touch"
            >
                <PlusIcon/> <span className="hidden sm:inline">Add Position</span>
            </Button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-3 py-2 text-left">Position Name</th>
                        <th scope="col" className="px-3 py-2 text-center">Candidates</th>
                        <th scope="col" className="px-3 py-2 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {positions.length > 0 ? positions.map(pos => (
                        <tr key={pos.id} className="border-b hover:bg-gray-50"> 
                            <td className="px-3 py-3 font-semibold text-dmi-blue-800">{pos.name}</td>
                            <td className="px-3 py-3 text-center">{pos.candidates.length}</td>
                            <td className="px-3 py-3">
                                <div className="flex justify-center space-x-2">
                                    <Button 
                                        size="sm" 
                                        variant="secondary" 
                                        onClick={() => onOpenModal('EDIT_POSITION', pos)}
                                        disabled={!permissions.canManagePositions}
                                        disabledTooltip="Requires Admin or Super Admin role."
                                        className="min-h-touch"
                                    ><EditIcon/> <span className="hidden sm:inline">Edit</span></Button>
                                    <Button 
                                        size="sm" 
                                        variant="danger" 
                                        onClick={() => onOpenModal('DELETE_POSITION', pos)}
                                        disabled={!permissions.canManagePositions}
                                        disabledTooltip="Requires Admin or Super Admin role."
                                        className="min-h-touch"
                                    ><TrashIcon/> <span className="hidden sm:inline">Delete</span></Button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                                <p>No positions found.</p>
                                {permissions.canManagePositions && (
                                    <p className="text-sm mt-2">Click "Add Position" to create your first position.</p>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </Card>
    );
};

// CandidatesView
interface CandidatesViewProps {
    positions: PositionWithCandidates[];
    permissions: Permissions;
    onOpenModal: (type: ModalType, data?: any) => void;
}
const CandidatesView: React.FC<CandidatesViewProps> = ({ positions, permissions, onOpenModal }) => {
     const [selectedPositionId, setSelectedPositionId] = useState<string | number | null>(positions[0]?.id || null);
    
    useEffect(() => {
        if (positions.length > 0 && (!selectedPositionId || !positions.find(p => p.id === selectedPositionId))) {
            setSelectedPositionId(positions[0].id);
        }
        if (positions.length === 0) {
            setSelectedPositionId(null);
        }
    }, [positions, selectedPositionId]);

    const selectedPosition = positions.find(p => p.id === selectedPositionId);
    
    return (
        <div className="space-y-4">
            <Card className="p-3">
                 <label htmlFor="position-select" className="block text-sm font-medium text-gray-700 mb-2">Select Position to Manage</label>
                 <select 
                    id="position-select"
                    value={selectedPositionId ?? ''}
                    onChange={(e) => setSelectedPositionId(Number(e.target.value))}
                    className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500"
                 >
                     {positions.length > 0 ? positions.map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                     )) : <option disabled>No positions available</option>}
                 </select>
            </Card>

            {selectedPosition ? (
                <Card>
                    <div className="p-3 flex justify-between items-center border-b">
                        <h2 className="text-lg font-bold text-dmi-blue-900">Candidates for: <span className="font-normal">{selectedPosition.name}</span></h2>
                        <Button 
                            onClick={() => onOpenModal('ADD_CANDIDATE', selectedPosition)}
                            disabled={!permissions.canManageCandidates}
                            disabledTooltip="Requires Admin or Super Admin role."
                            className="min-h-touch"
                        >
                            <PlusIcon/> <span className="hidden sm:inline">Add Candidate</span>
                        </Button>
                    </div>
                    <div className="p-3">
                        {selectedPosition.candidates.length > 0 ? (
                            <div className="space-y-2">
                                {selectedPosition.candidates.map(cand => (
                                    <div key={cand.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center space-x-3">
                                            <img src={cand.imageUrl || '/path/to/placeholder-image.png'} alt={cand.name} className="w-12 h-12 rounded-full object-cover"/>
                                            <div>
                                                <p className="font-semibold text-gray-800">{cand.name}</p>
                                                <p className="text-xs text-gray-500">{cand.manifesto ? (cand.manifesto.substring(0, 60) + (cand.manifesto.length > 60 ? '…' : '')) : 'No bio provided'}</p> 
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="secondary" onClick={() => onOpenModal('EDIT_CANDIDATE', { ...cand, positionId: selectedPosition.id })}
                                                disabled={!permissions.canManageCandidates}
                                                disabledTooltip="Requires Admin or Super Admin role."
                                                className="min-h-touch"
                                            ><EditIcon /> <span className="hidden sm:inline">Edit</span></Button>
                                            <Button size="sm" variant="danger" onClick={() => onOpenModal('DELETE_CANDIDATE', { ...cand, positionId: selectedPosition.id })}
                                                 disabled={!permissions.canManageCandidates}
                                                 disabledTooltip="Requires Admin or Super Admin role."
                                                 className="min-h-touch"
                                            ><TrashIcon /> <span className="hidden sm:inline">Delete</span></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <h3 className="text-lg font-semibold text-gray-700">No Candidates Yet</h3>
                                <p className="text-sm text-gray-500 mt-1">{permissions.canManageCandidates ? 'Click "Add Candidate" to get started.' : 'Contact an admin to add candidates.'}</p>
                            </div>
                        )}
                    </div>
                </Card>
            ) : (
                <Card className="flex items-center justify-center h-full p-6">
                     <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700">Select a Position</h3>
                        <p className="text-sm text-gray-500 mt-1">Choose a position from the dropdown to manage its candidates.</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

// UserManagementView
interface UserManagementViewProps {
    adminUsers: AdminUser[];
    permissions: Permissions;
    onOpenModal: (type: ModalType, data?: any) => void;
    onRefresh: () => void;
}
const UserManagementView: React.FC<UserManagementViewProps> = ({ adminUsers, permissions, onOpenModal, onRefresh }) => {
    return (
        <Card>
            <div className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-3">
                <h2 className="text-lg font-bold text-dmi-blue-900">Manage Admin Users</h2>
                <Button 
                    disabled={!permissions.canManageUsers}
                    disabledTooltip="Requires Super Admin role."
                    onClick={() => onOpenModal('ADD_USER')}
                    className="min-h-touch"
                >
                    <PlusIcon/> <span className="hidden sm:inline">Create New Admin</span>
                </Button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2">Username</th>
                            <th className="px-3 py-2">Role</th>
                            <th className="px-3 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminUsers.map(user => (
                            <tr key={user.id} className="border-b">
                                <td className="p-3 font-semibold text-dmi-blue-800">{user.username}</td>
                                <td className="p-3">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ 
                                         user.role === 'super_admin' ? 'bg-dmi-gold-500 text-white' : 
                                         user.role === 'admin' ? 'bg-dmi-blue-100 text-dmi-blue-800' :
                                         'bg-gray-200 text-gray-800'
                                     }`}>
                                         {user.role.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <div className="flex space-x-2">
                                        <Button 
                                            size="sm" variant="secondary" 
                                            disabled={!permissions.canManageUsers} 
                                            disabledTooltip="Requires Super Admin role."
                                            onClick={() => onOpenModal('EDIT_USER', user)}
                                            className="min-h-touch"
                                        ><EditIcon/> <span className="hidden sm:inline">Edit</span></Button>
                                        <Button 
                                            size="sm" 
                                            variant="danger" 
                                            disabled={!permissions.canManageUsers} 
                                            disabledTooltip="Requires Super Admin role."
                                            onClick={() => onOpenModal('DELETE_USER', user)}
                                            className="min-h-touch"
                                        ><TrashIcon/> <span className="hidden sm:inline">Delete</span></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {adminUsers.length === 0 && (
                <div className="text-center p-6 text-gray-500">
                    <p>No admin users found.</p>
                </div>
            )}
        </Card>
    );
};

// ManagementModals
interface ManagementModalsProps {
    modalState: ModalState;
    onClose: () => void;
    permissions: Permissions;
    positions: PositionWithCandidates[];
    onRefreshData: () => void;
    currentUser: AdminUser;
}

const ManagementModals: React.FC<ManagementModalsProps> = ({ modalState, onClose, permissions, positions, onRefreshData, currentUser }) => {
    const { isOpen, type, data } = modalState;

    if (!isOpen) return null;
    
    if ((type === 'ADD_POSITION' || type === 'EDIT_POSITION' || type === 'DELETE_POSITION') && permissions.canManagePositions) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={
                type === 'ADD_POSITION' ? 'Add New Position' : 
                type === 'EDIT_POSITION' ? 'Edit Position' : 
                'Delete Position'
            }>
                {type === 'ADD_POSITION' || type === 'EDIT_POSITION' ? (
                     <PositionForm
                        type={type}
                        position={data}
                        onSuccess={() => { onRefreshData(); onClose(); }}
                        onCancel={onClose}
                    />
                ) : (
                    <DeleteConfirmation
                        entityType="Position"
                        entityName={data.name}
                        onConfirm={async () => {
                            await sjbuApi.delete(`/positions/${data.id}`);
                            onRefreshData();
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                )}
            </Modal>
        );
    }
    
    if ((type === 'ADD_CANDIDATE' || type === 'EDIT_CANDIDATE' || type === 'DELETE_CANDIDATE') && permissions.canManageCandidates) {
        const positionName = (type === 'ADD_CANDIDATE' && data?.name) ? data.name : (data?.name || 'Position');
         return (
            <Modal isOpen={isOpen} onClose={onClose} title={
                 type === 'ADD_CANDIDATE' ? `Add Candidate to ${positionName}` : 
                 type === 'EDIT_CANDIDATE' ? 'Edit Candidate' : 
                 'Delete Candidate'
            }>
                {type === 'ADD_CANDIDATE' || type === 'EDIT_CANDIDATE' ? (
                     <CandidateForm
                        type={type}
                        candidate={type === 'EDIT_CANDIDATE' ? data : undefined}
                        positionId={type === 'ADD_CANDIDATE' ? data.id : data.positionId}
                        onSuccess={() => { onRefreshData(); onClose(); }}
                        onCancel={onClose}
                    />
                ) : (
                    <DeleteConfirmation
                        entityType="Candidate"
                        entityName={data.name}
                        onConfirm={async () => {
                            await sjbuApi.delete(`/positions/${data.positionId}/candidates/${data.id}`);
                            onRefreshData();
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                )}
            </Modal>
        );
    }

    if ((type === 'ADD_USER' || type === 'EDIT_USER' || type === 'DELETE_USER') && permissions.canManageUsers) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={
                type === 'ADD_USER' ? 'Create New Admin User' : 
                type === 'EDIT_USER' ? 'Edit Admin User' : 
                'Delete Admin User'
            }>
                {type === 'ADD_USER' || type === 'EDIT_USER' ? (
                    <UserForm
                        type={type}
                        user={data}
                        onSuccess={() => { onRefreshData(); onClose(); }}
                        onCancel={onClose}
                    />
                ) : (
                    <DeleteConfirmation
                        entityType="Admin User"
                        entityName={data.username}
                        onConfirm={async () => {
                            if (data.id === currentUser.id) {
                                alert("Error: Cannot deactivate the currently logged-in user.");
                                return;
                            }
                            await sjbuApi.delete(`/admin/${data.id}/deactivate`);
                            onRefreshData();
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                )}
            </Modal>
        );
    }

    return null;
};

// PositionForm
const PositionForm = ({ type, position, onSuccess, onCancel }: { type: 'ADD_POSITION' | 'EDIT_POSITION', position?: PositionWithCandidates, onSuccess: () => void, onCancel: () => void }) => {
    const [name, setName] = useState(position?.name || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (type === 'ADD_POSITION') {
                await sjbuApi.post('/positions', { position_name: name });
            } else {
                await sjbuApi.put(`/positions/${position!.id}`, { position_name: name });
            }
            onSuccess();
        } catch (err) {
             const message = isAxiosError(err) && err.response?.data?.message || 'Failed to save position.';
             setError(message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label htmlFor="pos-name" className="block text-sm font-medium text-gray-700">Position Name</label>
                <input type="text" id="pos-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500 sm:text-sm" />
            </div>
            <div className="flex justify-end space-x-3 pt-3">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? <Spinner /> : (type === 'ADD_POSITION' ? 'Create Position' : 'Update Position')}</Button>
            </div>
        </form>
    );
};

// CandidateForm
const CandidateForm = ({ type, candidate, positionId, onSuccess, onCancel }: { type: 'ADD_CANDIDATE' | 'EDIT_CANDIDATE', candidate?: Candidate, positionId: number | string, onSuccess: () => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
        name: candidate?.name || '',
        manifesto: (candidate as any)?.manifesto || candidate?.manifesto || '',
        imageUrl: candidate?.imageUrl || null,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const positionIdNum = Number(positionId);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUploadSuccess = (cloudinaryUrl: string) => {
        setFormData({ ...formData, imageUrl: cloudinaryUrl });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.imageUrl) {
            setError('Please upload an image before saving the candidate.');
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                 name: formData.name,
                 positionId: positionIdNum,
                 imageUrl: formData.imageUrl,
                 manifesto: formData.manifesto,
            };
            
            if (type === 'ADD_CANDIDATE') {
                await (sjbuApi as any).createCandidate(payload); 
            } else {
                await (sjbuApi as any).updateCandidate(candidate!.id, payload); 
            }
            onSuccess();
        } catch (err) {
             const message = isAxiosError(err) && err.response?.data?.error || 'Failed to save candidate.';
             setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {error && <div className="md:col-span-3 text-red-500 text-sm">{error}</div>}
             <div className="md:col-span-1">
                <ImageUploader 
                    imageUrl={formData.imageUrl} 
                    onUploadSuccess={handleImageUploadSuccess} 
                    disabled={isLoading}
                />
            </div>
            <div className="md:col-span-2 space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bio / Manifesto</label>
                    <textarea name="manifesto" value={formData.manifesto} onChange={handleChange} required rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
                </div>
            </div>
            <div className="md:col-span-3 flex justify-end space-x-3 pt-3 border-t mt-2">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading || !formData.imageUrl}>{isLoading ? <Spinner /> : (type === 'ADD_CANDIDATE' ? 'Create Candidate' : 'Update Candidate')}</Button>
            </div>
        </form>
    );
};

// UserForm
const UserForm = ({ type, user, onSuccess, onCancel }: { type: 'ADD_USER' | 'EDIT_USER', user?: AdminUser, onSuccess: () => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        role: user?.role || 'moderator' as AdminRole,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const isEditing = !!user;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value as AdminRole | string });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const dataToSave: any = { ...formData };
            if (isEditing && !formData.password) {
                delete dataToSave.password; 
            }
            if (!isEditing && !formData.email) {
                 dataToSave.email = `${dataToSave.username}@sjbu-voting.com`;
            }

            if (type === 'ADD_USER') {
                await sjbuApi.post('/admin/create', dataToSave); 
            } else {
                await sjbuApi.put(`/admin/${user!.id}/role`, { role: dataToSave.role }); 
            }
            onSuccess();
        } catch (err) {
             const message = isAxiosError(err) && err.response?.data?.message || 'Failed to save admin user.';
             setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!isEditing} placeholder={isEditing ? 'Leave blank to keep current password' : ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500">
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-3">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? <Spinner /> : (isEditing ? 'Update User' : 'Create User')}</Button>
            </div>
        </form>
    );
};

// DeleteConfirmation
const DeleteConfirmation: React.FC<{ entityType: string, entityName: string, onConfirm: () => void, onCancel: () => void }> = ({ entityType, entityName, onConfirm, onCancel }) => (
    <>
        <p className="text-gray-700">Are you sure you want to delete <strong>{entityName}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3 mt-4">
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button variant="danger" onClick={onConfirm}>Delete {entityType}</Button>
        </div>
    </>
);

export default AdminDashboard;
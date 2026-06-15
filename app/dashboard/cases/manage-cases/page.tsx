'use client';

import { useEffect, useState } from 'react';
import { caseWorkspaceService } from '@/_services/case/caseWorkspaceService';
import { User } from '../../../../models/user';
import { CaseDetails } from '../../../../models/case';
import { 
    Search, Calendar, AlertCircle, Briefcase, 
    ChevronLeft, ChevronRight, CheckCircle2, ShieldAlert,
    Clock, PlayCircle, Lock, Archive, Bell, Eye, X
} from 'lucide-react';

const CASE_STATUSES = ['PENDING_REVIEW', 'ACCEPTED', 'ONGOING', 'CLOSED', 'ARCHIVED'];

export default function ManageCasesPage() {
    const [cases, setCases] = useState<CaseDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [lawFirmCode, setLawFirmCode] = useState('');

    // --- Tab & Filter State ---
    const [activeStatus, setActiveStatus] = useState('PENDING_REVIEW');
    const [pendingCount, setPendingCount] = useState(0);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / pageSize);

    // --- Update & View State ---
    const [updatingCaseId, setUpdatingCaseId] = useState<number | null>(null);
    const [selectedCase, setSelectedCase] = useState<CaseDetails | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // 1. Initialize User & Law Firm Code
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user: User = JSON.parse(storedUser);
            if (user.lawFirmCode) {
                setLawFirmCode(user.lawFirmCode);
            } else {
                setError("No Law Firm Code found in session.");
            }
        }
    }, []);

    // 2. Fetch Cases based on Active Tab & Pagination
    const fetchCases = async () => {
        if (!lawFirmCode) return;
        setIsLoading(true);
        setError('');

        try {
            const response = await caseWorkspaceService.getCasesByStatus(lawFirmCode, activeStatus, currentPage, pageSize);
            
            // Handle standard Spring Boot Pagination Wrapper
            const casesList = response.data?.content || response.data || [];
            const count = response.data?.totalElements || response.totalItems || casesList.length;

            setCases(casesList);
            setTotalItems(count);
        } catch (err: any) {
            setError(err.message || "Failed to load cases.");
            setCases([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Fetch Pending Notification Count
    const fetchPendingCount = async () => {
        if (!lawFirmCode) return;
        try {
            // Fetch page 0, size 1 just to get the totalElements for PENDING_REVIEW
            const response = await caseWorkspaceService.getCasesByStatus(lawFirmCode, 'PENDING_REVIEW', 0, 1);
            const count = response.data?.totalElements || response.totalItems || 0;
            setPendingCount(count);
        } catch (err) {
            console.error("Could not fetch pending review count", err);
        }
    };

    useEffect(() => {
        if (lawFirmCode) {
            fetchCases();
            fetchPendingCount(); // Refresh the badge count whenever tab or page changes
        }
    }, [lawFirmCode, activeStatus, currentPage, pageSize]);

    // --- Handlers ---
    const handleStatusUpdate = async (caseId: number, newStatus: string) => {
        setUpdatingCaseId(caseId);
        try {
            await caseWorkspaceService.updateCaseStatus(caseId, newStatus);
            // Refresh data to move the case out of the current view (if status changed)
            await fetchCases();
            await fetchPendingCount();
        } catch (err: any) {
            alert(err.message || "Failed to update case status.");
        } finally {
            setUpdatingCaseId(null);
        }
    };

    const handleTabChange = (status: string) => {
        setActiveStatus(status);
        setCurrentPage(0); // Reset to first page when switching tabs
    };

    const handleViewCase = (caseObj: CaseDetails) => {
        setSelectedCase(caseObj);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedCase(null);
    };

    // Helper to render beautiful status badges
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING_REVIEW': return <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-200"><Clock className="w-3.5 h-3.5"/> Pending</span>;
            case 'ACCEPTED': return <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-200"><CheckCircle2 className="w-3.5 h-3.5"/> Accepted</span>;
            case 'ONGOING': return <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200"><PlayCircle className="w-3.5 h-3.5"/> Ongoing</span>;
            case 'CLOSED': return <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-300"><Lock className="w-3.5 h-3.5"/> Closed</span>;
            case 'ARCHIVED': return <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200"><Archive className="w-3.5 h-3.5"/> Archived</span>;
            default: return <span className="text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            
            {/* Header & Notifications */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                        Case Status Management
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Review, manage, and update the lifecycle of your firm's cases.</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
                    <Bell className="w-5 h-5 text-amber-600 animate-pulse" />
                    <span className="text-sm font-medium text-amber-800">Pending Review:</span>
                    <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {pendingCount}
                    </span>
                </div>
            </div>

            {/* Status Navigation Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {CASE_STATUSES.map((status) => (
                    <button
                        key={status}
                        onClick={() => handleTabChange(status)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                            activeStatus === status 
                                ? 'bg-slate-900 text-white shadow-md' 
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {status.replace('_', ' ')}
                        {status === 'PENDING_REVIEW' && pendingCount > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${activeStatus === status ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Data Table Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="py-4 px-6">Case Details</th>
                                <th className="py-4 px-6">Filing Info</th>
                                <th className="py-4 px-6">Current Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={4} className="py-16 text-center"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-blue-600"></div></td></tr>
                            ) : error ? (
                                <tr><td colSpan={4} className="py-16 text-center text-red-500"><ShieldAlert className="w-8 h-8 mx-auto mb-2"/>{error}</td></tr>
                            ) : cases.length === 0 ? (
                                <tr><td colSpan={4} className="py-16 text-center text-slate-500">No {activeStatus.replace('_', ' ').toLowerCase()} cases found.</td></tr>
                            ) : (
                                cases.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-slate-900 truncate max-w-[250px]">{c.caseTitle}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{c.caseNumber}</div>
                                            <div className="text-xs text-slate-400 mt-1 truncate max-w-[250px]">Opposite: {c.oppositeParty}</div>
                                        </td>
                                        <td className="py-4 px-6 space-y-1">
                                            <div className="flex items-center text-sm text-slate-600"><Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" /> {c.filingDate || 'N/A'}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[200px]">Type: {c.caseType?.typeName || 'N/A'}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[200px]">Lawyer: {c.assignedLawyer}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {getStatusBadge(c.status)}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="inline-flex items-center justify-end gap-3">
                                                {/* Action Button for View Case */}
                                                <button 
                                                    onClick={() => handleViewCase(c)}
                                                    title="View Case Details"
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>

                                                {/* Action Dropdown for Status Update */}
                                                <div className="relative flex items-center">
                                                    <select 
                                                        value={c.status}
                                                        onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                                                        disabled={updatingCaseId === c.id}
                                                        className="border border-slate-300 rounded-lg text-sm text-slate-700 py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer disabled:opacity-50"
                                                    >
                                                        {CASE_STATUSES.map(s => (
                                                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                                        ))}
                                                    </select>
                                                    {updatingCaseId === c.id && (
                                                        <div className="absolute -left-6 mt-0.5 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!isLoading && cases.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Rows per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                                    className="border border-slate-300 rounded-md bg-white text-sm text-slate-700 py-1 pl-2 pr-6 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value={2}>2</option>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                            <div className="text-sm text-slate-600 hidden sm:block">
                                Showing <span className="font-medium text-slate-900">{currentPage * pageSize + 1}</span> to <span className="font-medium text-slate-900">{Math.min((currentPage + 1) * pageSize, totalItems)}</span> of <span className="font-medium text-slate-900">{totalItems}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-medium text-slate-700 px-2">
                                Page {currentPage + 1} of {Math.max(1, totalPages)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1 || totalPages === 0}
                                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- View Case Details Modal --- */}
            {isViewModalOpen && selectedCase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                                Case Overview
                            </h3>
                            <button onClick={closeViewModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900">{selectedCase.caseTitle}</h4>
                                    <p className="text-sm font-mono text-slate-500 mt-1">Case No: {selectedCase.caseNumber}</p>
                                </div>
                                <div>
                                    {getStatusBadge(selectedCase.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Case Type</label>
                                    <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.caseType?.typeName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Filing Date</label>
                                    <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.filingDate}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Assigned Court</label>
                                    <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.court?.courtName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Assigned Lawyer</label>
                                    <p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.assignedLawyer}</p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Opposite Party</label>
                                <p className="text-sm font-medium text-slate-700 mt-0.5 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedCase.oppositeParty}</p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase">Description / Overview</label>
                                <p className="text-sm text-slate-700 mt-1.5 leading-relaxed bg-white border border-slate-200 p-4 rounded-lg break-words whitespace-pre-wrap">
                                    {selectedCase.description}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                            <button onClick={closeViewModal} className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
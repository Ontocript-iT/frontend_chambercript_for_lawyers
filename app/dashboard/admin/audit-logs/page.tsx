'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '../../../../_services/admin/adminService';
import { User } from '../../../../models/user';
import { Activity, Clock, ShieldAlert, ArrowLeft, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface AuditLog {
    id: number;
    action: string;
    details: string;
    entityId: string;
    entityName: string;
    performedBy: string;
    lawFirmCode: string;
    timestamp: string;
}

export default function AuditLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed for Spring Boot
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / pageSize);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            setError('');
            
            try {
                const storedUser = localStorage.getItem('user');
                if (!storedUser) throw new Error("No active session found.");

                const user: User = JSON.parse(storedUser);
                if (!user.lawFirmCode) throw new Error("Law Firm Code missing from user session.");

                const result = await adminService.getAuditLogs(user.lawFirmCode, currentPage, pageSize);
                
                // Read the paginated data and total count exactly as your backend sends it
                setLogs(result.data || []);
                setTotalItems(result.totalItems || 0);

            } catch (err: any) {
                setError(err.message || 'Failed to fetch audit logs');
                setLogs([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [currentPage, pageSize]); // Refetch when page or size changes

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(date);
    };

    const getActionBadgeColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0); // Reset to first page
    };

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.back()} 
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">
                        System Audit Logs
                    </h1>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-slate-900">Activity Ledger</h2>
                    </div>
                </div>

                {isLoading && logs.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : error ? (
                    <div className="m-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                        {error}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b font-semibold">
                                    <th className="p-4">Timestamp</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Performed By</th>
                                    <th className="p-4">Entity</th>
                                    <th className="p-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors text-sm">
                                            <td className="p-4 text-slate-600 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {formatTime(log.timestamp)}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getActionBadgeColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-700 font-medium whitespace-nowrap">
                                                {log.performedBy}
                                            </td>
                                            <td className="p-4 text-slate-700 font-medium whitespace-nowrap flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                {log.entityName} <span className="text-slate-400 font-normal">#{log.entityId}</span>
                                            </td>
                                            <td className="p-4 text-slate-600 max-w-md truncate">
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-slate-500">
                                            No audit logs found for your firm.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {logs.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Rows per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    className="border border-slate-300 rounded-md bg-white text-sm text-slate-700 py-1 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <div className="text-sm text-slate-600 hidden sm:block">
                                Showing <span className="font-medium text-slate-900">{totalItems === 0 ? 0 : currentPage * pageSize + 1}</span> to <span className="font-medium text-slate-900">{Math.min((currentPage + 1) * pageSize, totalItems)}</span> of <span className="font-medium text-slate-900">{totalItems}</span> entries
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-medium text-slate-700 px-2">
                                Page {currentPage + 1} of {Math.max(1, totalPages)}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages - 1 || totalPages === 0}
                                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
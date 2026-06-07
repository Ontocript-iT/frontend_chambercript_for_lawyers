'use client';

import { useEffect, useState } from 'react';
import { LawFirmAdmin } from '../../../../models/superAdmin';
import { Search, Building, Users, Mail, Phone, Contact2, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { superAdminService } from '@/_services/super-admin/super-admin.service';

export default function DirectoryPage() {
    const [lawFirms, setLawFirms] = useState<LawFirmAdmin[]>([]);
    const [firmSearchQuery, setFirmSearchQuery] = useState('');
    const [isFirmsLoading, setIsFirmsLoading] = useState(true);
    const [firmsError, setFirmsError] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(0); 
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / pageSize);

    useEffect(() => {
        // Only fetch paginated list if we aren't actively searching for a specific firm
        if (!firmSearchQuery) {
            fetchAllLawFirms();
        }
    }, [currentPage, pageSize]);

    const fetchAllLawFirms = async () => {
        setIsFirmsLoading(true); 
        setFirmsError('');
        try {
            const result = await superAdminService.getAllLawFirms(currentPage, pageSize);
            setLawFirms(result.data || []);
            setTotalItems(result.totalItems || 0);
        } catch (err: any) { 
            setFirmsError(err.message); 
            setLawFirms([]);
        } finally { 
            setIsFirmsLoading(false); 
        }
    };

    const handleFirmSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!firmSearchQuery) {
            setCurrentPage(0); // Reset pagination
            return fetchAllLawFirms();
        }
        
        setIsFirmsLoading(true); 
        setFirmsError('');
        
        try {
            const data = await superAdminService.searchLawFirmByCode(firmSearchQuery);
            setLawFirms(data ? [data] : []);
            setTotalItems(data ? 1 : 0); // Search returns 1 specific result
        } catch (err: any) { 
            setFirmsError(err.message); 
            setLawFirms([]);
            setTotalItems(0);
        } finally { 
            setIsFirmsLoading(false); 
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
        <div>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <form onSubmit={handleFirmSearch} className="relative max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        value={firmSearchQuery}
                        onChange={(e) => {
                            setFirmSearchQuery(e.target.value.toUpperCase());
                            if (e.target.value === '') {
                                setCurrentPage(0); // Reset to page 0 if search is cleared
                            }
                        }}
                        placeholder="Search specific firm by Code (e.g., LF000001)..." 
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow font-mono"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                        Search
                    </button>
                </form>
            </div>

            <div className="p-6 bg-slate-50 min-h-[400px]">
                {isFirmsLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : firmsError ? (
                    <div className="p-8 text-center text-red-600 font-medium bg-red-50 rounded-xl border border-red-100">
                        {firmsError}
                    </div>
                ) : lawFirms.length === 0 ? (
                    <div className="p-16 text-center text-slate-500">No law firms found.</div>
                ) : (
                    <div className="space-y-6">
                        {lawFirms.filter(firm => firm.role === 'ADMIN').map((firm) => (
                            <div key={firm.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Building className="w-5 h-5 text-indigo-400" />
                                            {firm.firstName} {firm.lastName} (Firm Admin)
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-300">
                                            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4"/> {firm.email}</span>
                                            {firm.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4"/> {firm.phone}</span>}
                                            {firm.nic && <span className="flex items-center gap-1.5"><Contact2 className="w-4 h-4"/> NIC: {firm.nic}</span>}
                                        </div>
                                    </div>
                                    <div className="bg-indigo-500/20 border border-indigo-400/30 px-4 py-2 rounded-lg text-center">
                                        <p className="text-xs uppercase tracking-wider text-indigo-200 font-bold mb-0.5">Firm Code</p>
                                        <p className="text-lg font-mono font-bold text-white">{firm.lawFirmCode || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="p-0">
                                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Registered Personnel
                                        </h4>
                                        <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                                            Total: {firm.createdEmployees?.length || 0}
                                        </span>
                                    </div>
                                    
                                    {(!firm.createdEmployees || firm.createdEmployees.length === 0) ? (
                                        <div className="p-8 text-center text-slate-500 text-sm">No personnel registered for this firm yet.</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="bg-white border-b border-slate-100 text-slate-500 font-medium">
                                                        <th className="py-3 px-6">Name</th>
                                                        <th className="py-3 px-6">Contact Info</th>
                                                        <th className="py-3 px-6">Role</th>
                                                        <th className="py-3 px-6">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {firm.createdEmployees.map((emp) => {
                                                        const user = emp.userAccount;
                                                        return (
                                                            <tr key={emp.id} className="hover:bg-slate-50/50">
                                                                <td className="py-3 px-6 font-medium text-slate-900">
                                                                    {user.firstName} {user.lastName}
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <div className="text-slate-600">{user.email}</div>
                                                                    {user.phone && <div className="text-xs text-slate-400 mt-0.5">{user.phone}</div>}
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded uppercase tracking-wider">
                                                                        {user.role.replace('ROLE_', '')}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    {user.enabled 
                                                                        ? <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Active</span>
                                                                        : <span className="text-slate-400 font-medium flex items-center gap-1"><XCircle className="w-3.5 h-3.5"/> Disabled</span>
                                                                    }
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!isFirmsLoading && lawFirms.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">Firms per page:</span>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                disabled={!!firmSearchQuery}
                                className="border border-slate-300 rounded-md bg-white text-sm text-slate-700 py-1 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="text-sm text-slate-600 hidden sm:block">
                            Showing <span className="font-medium text-slate-900">{totalItems === 0 ? 0 : currentPage * pageSize + 1}</span> to <span className="font-medium text-slate-900">{Math.min((currentPage + 1) * pageSize, totalItems)}</span> of <span className="font-medium text-slate-900">{totalItems}</span> firms
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 0 || !!firmSearchQuery}
                            className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-slate-700 px-2">
                            Page {currentPage + 1} of {Math.max(1, totalPages)}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages - 1 || totalPages === 0 || !!firmSearchQuery}
                            className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
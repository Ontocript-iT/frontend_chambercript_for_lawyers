'use client';

import { useEffect, useState } from 'react';
import { SuperAdminSubscription } from '../../../../models/superAdmin';
import { Search, CheckCircle2, XCircle, ListFilter, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { superAdminService } from '@/_services/super-admin/super-admin.service';


export default function SubscriptionsPage() {
    const [subTab, setSubTab] = useState<'all' | 'inactive'>('all');
    const [subscriptions, setSubscriptions] = useState<SuperAdminSubscription[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubsLoading, setIsSubsLoading] = useState(true);
    const [subsError, setSubsError] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / pageSize);

    useEffect(() => {
        // Only fetch paginated data if not currently searching
        if (!searchQuery) {
            fetchSubscriptions(subTab);
        }
    }, [subTab, currentPage, pageSize]);

    const fetchSubscriptions = async (currentTab: 'all' | 'inactive') => {
        setIsSubsLoading(true); 
        setSubsError('');
        try {
            let result;
            if (currentTab === 'inactive') {
                result = await superAdminService.getInactiveSubscriptions(currentPage, pageSize);
            } else {
                result = await superAdminService.getAllSubscriptions(currentPage, pageSize);
            }
            setSubscriptions(result.data || []);
            setTotalItems(result.totalItems || 0);
        } catch (err: any) { 
            setSubsError(err.message); 
            setSubscriptions([]);
            setTotalItems(0);
        } finally { 
            setIsSubsLoading(false); 
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!searchQuery) {
            setCurrentPage(0);
            return fetchSubscriptions(subTab);
        }
        
        setIsSubsLoading(true); 
        setSubsError('');
        try {
            const data = await superAdminService.searchSubscriptions(searchQuery);
         const results = Array.isArray(data) ? data : ((data as any).data || [data]);
            setSubscriptions(results);
            setTotalItems(results.length);
            setSubTab('all'); 
            setCurrentPage(0);
        } catch (err: any) { 
            setSubsError(err.message); 
            setSubscriptions([]);
            setTotalItems(0);
        } finally { 
            setIsSubsLoading(false); 
        }
    };

    const handleActivate = async (id: number) => {
        try {
            await superAdminService.activateSubscription(id);
            
            if (subTab === 'inactive') {
                setSubscriptions(prev => prev.filter(sub => sub.id !== id));
                setTotalItems(prev => Math.max(0, prev - 1));
            } else {
                setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, active: true } : sub));
            }
        } catch (err: any) { 
            alert(err.message); 
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
        setCurrentPage(0);
    };

    return (
        <div>
            {/* Header Controls: Tabs & Search */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                
                {/* Inner Navigation Toggle */}
                <div className="bg-slate-200/50 p-1 rounded-lg inline-flex w-full sm:w-auto border border-slate-200">
                    <button 
                        onClick={() => { 
                            setSearchQuery(''); 
                            setSubTab('all'); 
                            setCurrentPage(0); 
                        }}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${subTab === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All Plans
                    </button>
                    <button 
                        onClick={() => { 
                            setSearchQuery(''); 
                            setSubTab('inactive'); 
                            setCurrentPage(0); 
                        }}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors ${subTab === 'inactive' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ListFilter className="w-4 h-4" /> Pending Activation
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value === '') {
                                setCurrentPage(0);
                            }
                        }}
                        placeholder="Search by Admin Email or NIC..." 
                        className="w-full pl-9 pr-4 py-2.5 text-slate-500 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700">
                        Search
                    </button>
                </form>
            </div>

            {/* Table Area */}
            <div className="p-0 overflow-x-auto min-h-[400px]">
                {isSubsLoading ? (
                    <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                ) : subsError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mb-3 bg-red-50 rounded-full p-2" />
                        <p className="font-medium text-slate-800">{subsError}</p>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                        <CheckCircle2 className="w-12 h-12 text-slate-300 mb-4" />
                        <h4 className="text-lg font-bold text-slate-800">
                            {subTab === 'inactive' ? 'No Inactive Plans' : 'No Subscriptions Found'}
                        </h4>
                        <p className="text-sm mt-1">
                            {subTab === 'inactive' ? 'All law firm subscriptions are currently active.' : 'No records match your query.'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="py-4 px-6">Firm Admin</th>
                                <th className="py-4 px-6">Plan Details</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-slate-900">{sub.adminName}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Admin ID: {sub.adminId}</div>
                                
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase border border-indigo-100 mb-1">
                                            {sub.planType}
                                        </span>
                                        <div className="text-xs text-slate-500">Max Emp: {sub.maxEmployees} • Storage: {sub.maxStorageGb}GB</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {sub.active 
                                            ? <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><CheckCircle2 className="w-4 h-4"/> Active</span>
                                            : <span className="inline-flex items-center gap-1.5 text-amber-500 text-sm font-medium"><XCircle className="w-4 h-4"/> Inactive</span>
                                        }
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {!sub.active ? (
                                            <button 
                                                onClick={() => handleActivate(sub.id)} 
                                                className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                            >
                                                Activate Plan
                                            </button>
                                        ) : (
                                            <span className="text-xs font-medium text-slate-400">Setup Complete</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {!isSubsLoading && subscriptions.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                disabled={!!searchQuery}
                                className="border border-slate-300 rounded-md bg-white text-sm text-slate-700 py-1 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                            disabled={currentPage === 0 || !!searchQuery}
                            className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-slate-700 px-2">
                            Page {currentPage + 1} of {Math.max(1, totalPages)}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages - 1 || totalPages === 0 || !!searchQuery}
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
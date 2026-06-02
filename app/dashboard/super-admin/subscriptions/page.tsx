// app/dashboard/super-admin/subscriptions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { SuperAdminSubscription } from '../../../../models/superAdmin';
import { Search, CheckCircle2, XCircle, ListFilter, AlertCircle } from 'lucide-react';
import { superAdminService } from '@/_services/super-admin/super-admin.service';

export default function SubscriptionsPage() {
    const [subTab, setSubTab] = useState<'all' | 'inactive'>('all');
    const [subscriptions, setSubscriptions] = useState<SuperAdminSubscription[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubsLoading, setIsSubsLoading] = useState(true);
    const [subsError, setSubsError] = useState('');

    useEffect(() => {
        fetchSubscriptions(subTab);
    }, [subTab]);

    const fetchSubscriptions = async (currentTab: 'all' | 'inactive') => {
        setIsSubsLoading(true); setSubsError('');
        try {
            let data;
            if (currentTab === 'inactive') {
                data = await superAdminService.getInactiveSubscriptions();
            } else {
                data = await superAdminService.getAllSubscriptions();
            }
            setSubscriptions(data);
        } catch (err: any) { 
            setSubsError(err.message); 
        } finally { 
            setIsSubsLoading(false); 
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return fetchSubscriptions(subTab);
        
        setIsSubsLoading(true); setSubsError('');
        try {
            // When searching, we hit the search endpoint (which usually searches across all)
            const data = await superAdminService.searchSubscriptions(searchQuery);
            setSubscriptions(data);
            setSubTab('all'); // Reset tab to 'all' since search results might include both
        } catch (err: any) { 
            setSubsError(err.message); 
        } finally { 
            setIsSubsLoading(false); 
        }
    };

    const handleActivate = async (id: number) => {
        try {
            await superAdminService.activateSubscription(id);
            
            // If we are looking at the inactive list, remove it from the screen.
            // If we are looking at the 'all' list, just update its status to active.
            if (subTab === 'inactive') {
                setSubscriptions(prev => prev.filter(sub => sub.id !== id));
            } else {
                setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, active: true } : sub));
            }
        } catch (err: any) { 
            alert(err.message); 
        }
    };

    return (
        <div>
            {/* Header Controls: Tabs & Search */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                
                {/* Inner Navigation Toggle */}
                <div className="bg-slate-200/50 p-1 rounded-lg inline-flex w-full sm:w-auto border border-slate-200">
                    <button 
                        onClick={() => { setSearchQuery(''); setSubTab('all'); }}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${subTab === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All Plans
                    </button>
                    <button 
                        onClick={() => { setSearchQuery(''); setSubTab('inactive'); }}
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Admin Email or NIC..." 
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
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
        </div>
    );
}
// app/dashboard/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '../../../_services/admin/adminService';
import { AuditLog } from '../../../models/auditLog';
import { User } from '../../../models/user';
import { Activity, UserPlus, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [futureCaseCount, setFutureCaseCount] = useState<number>(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) return;
            const user: User = JSON.parse(storedUser);

            if (!user.lawFirmCode) {
                setError("Law Firm Code missing from user session.");
                setIsLoading(false);
                return;
            }

            try {
                const auditData = await adminService.getAuditLogs(user.lawFirmCode);
                const sortedLogs = auditData.sort((a: any, b: any) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                setLogs(sortedLogs);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchFutureCasesCount = async () => {
            try {
                const result = await adminService.getFutureCases(); 
                if (result && result.data) {
                    setFutureCaseCount(result.caseCount || result.data.length);
                }
            } catch (err) {
                console.error("Failed to fetch future cases:", err);
            }
        };

        fetchDashboardData();
        fetchFutureCasesCount();
    }, []);

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="space-y-8 max-w-6xl">
            <div>   
                <h1 className="text-3xl font-serif font-bold text-slate-900">
                    Administrator Overview
                </h1>
                <p className="text-slate-600 mt-2">
                    Welcome to the central command for Justice & Associates. From here you can manage users, oversee firm-wide metrics, and configure system settings.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-blue-900">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Active Personnel</h3>
                    <p className="text-4xl font-bold text-slate-900 mt-2">24</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-amber-500">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Open Cases</h3>
                    <p className="text-4xl font-bold text-slate-900 mt-2">142</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-purple-600 flex flex-col justify-between">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Future Cases</h3>
                    <div className="flex justify-between items-end mt-2">
                        <p className="text-4xl font-bold text-slate-900">{futureCaseCount}</p>
                        <button 
                            onClick={() => router.push('/dashboard/admin/future-cases')}
                            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors bg-purple-50 px-2 py-1 rounded"
                        >
                            View All <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-emerald-600">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">System Status</h3>
                    <p className="text-xl font-bold text-emerald-600 mt-3 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                        Healthy
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
                    <Activity className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-bold text-slate-900">Recent Firm Activity</h2>
                </div>
                
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 flex items-center gap-2 p-4 bg-red-50 rounded-lg">
                            <ShieldAlert className="w-5 h-5" />
                            {error}
                        </div>
                    ) : logs.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No recent activity found.</p>
                    ) : (
                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                            {logs.map((log) => (
                                <div key={log.id} className="relative pl-8">
                                    <div className="absolute -left-[11px] top-1 bg-white border-2 border-amber-500 rounded-full p-1">
                                        <UserPlus className="w-3 h-3 text-amber-600" />
                                    </div>
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1">
                                            <h4 className="text-sm font-semibold text-slate-900">
                                                {log.action} <span className="font-normal text-slate-500 ml-1">on {log.entityName}</span>
                                            </h4>
                                            <span className="flex items-center text-xs font-medium text-slate-400">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {formatTime(log.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                                            {log.details}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
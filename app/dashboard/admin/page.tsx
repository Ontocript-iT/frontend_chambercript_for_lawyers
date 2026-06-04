'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '../../../_services/admin/adminService';
import { AuditLog } from '../../../models/auditLog';
import { User } from '../../../models/user';
import { 
    Activity, UserPlus, Clock, ShieldAlert, ArrowRight, 
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, X 
} from 'lucide-react';

interface FutureCase {
    id: number;
    caseNumber: string;
    caseTitle: string;
    filingDate: string;
    assignedLawyer: string;
    court: {
        courtName: string;
        location: string;
    };
    status: string;
    hearings?: any[]; 
}

export default function AdminDashboard() {
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [futureCasesList, setFutureCasesList] = useState<FutureCase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Modal State
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [selectedDayCases, setSelectedDayCases] = useState<FutureCase[]>([]);
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);

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

        const fetchFutureCases = async () => {
            try {
                const result = await adminService.getFutureCases(); 
                if (result && result.data) {
                    setFutureCasesList(result.data);
                }
            } catch (err) {
                console.error("Failed to fetch future cases:", err);
            }
        };

        fetchDashboardData();
        fetchFutureCases();
    }, []);

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    // Calendar Helper Functions
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getCasesForDay = (day: number) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return futureCasesList.filter(c => 
            (c.filingDate && c.filingDate.startsWith(dateStr)) || 
            (c.hearings && c.hearings.some(h => h.hearingDate?.startsWith(dateStr)))
        );
    };

    const handleDayClick = (day: number, dayCases: FutureCase[]) => {
        if (dayCases.length > 0) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            setSelectedDay(date);
            setSelectedDayCases(dayCases);
            setIsDayModalOpen(true);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl relative">
            <div>   
                <h1 className="text-3xl font-serif font-bold text-slate-900">
                    Administrator Overview
                </h1>
                <p className="text-slate-600 mt-2">
                    Welcome to the central command for Justice & Associates. From here you can manage users, oversee firm-wide metrics, and configure system settings.
                </p>
            </div>
            
            {/* Top Stat Cards */}
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
                        <p className="text-4xl font-bold text-slate-900">{futureCasesList.length}</p>
                        <button 
                            onClick={() => router.push('/dashboard/future-cases')}
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

            {/* Main Content Grid: Activity & Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Recent Firm Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2 flex flex-col h-[500px]">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
                        <Activity className="w-5 h-5 text-amber-600" />
                        <h2 className="text-lg font-bold text-slate-900">Recent Firm Activity</h2>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1">
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

                {/* Calendar View */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-1 flex flex-col h-[500px]">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-purple-50">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-purple-600" />
                            <h2 className="text-lg font-bold text-slate-900">Future Cases</h2>
                        </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <button 
                                onClick={prevMonth} 
                                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-600"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h3 className="text-md font-bold text-slate-800">
                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </h3>
                            <button 
                                onClick={nextMonth} 
                                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-600"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                <div key={day} className="text-center text-xs font-semibold text-slate-500 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 flex-1">
                            {blanks.map((blank) => (
                                <div key={`blank-${blank}`} className="p-2 text-center text-sm text-transparent bg-slate-50/50 rounded-md">
                                    0
                                </div>
                            ))}
                            {days.map((day) => {
                                const dayCases = getCasesForDay(day);
                                const hasCases = dayCases.length > 0;
                                const isToday = 
                                    day === new Date().getDate() && 
                                    currentMonth.getMonth() === new Date().getMonth() && 
                                    currentMonth.getFullYear() === new Date().getFullYear();

                                return (
                                    <div 
                                        key={day} 
                                        onClick={() => handleDayClick(day, dayCases)}
                                        className={`
                                            relative flex items-center justify-center p-2 rounded-md text-sm font-medium transition-all
                                            ${hasCases ? 'cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200' : 'text-slate-700 hover:bg-slate-50 border border-transparent'}
                                            ${isToday && !hasCases ? 'bg-slate-100 text-blue-600 font-bold' : ''}
                                        `}
                                    >
                                        {day}
                                        {hasCases && (
                                            <div className="absolute top-1 right-1 flex space-x-[2px]">
                                                {dayCases.slice(0, 3).map((_, idx) => (
                                                    <span key={idx} className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-purple-600"></span> Scheduled Hearings
                            </div>
                            <button 
                                onClick={() => router.push('/dashboard/future-cases')}
                                className="text-purple-600 hover:text-purple-800 font-semibold"
                            >
                                Open Registry
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Day Detail Modal */}
            {isDayModalOpen && selectedDay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        <div className="flex justify-between items-center p-4 border-b border-purple-200 bg-purple-50">
                            <h3 className="font-bold text-lg text-purple-900 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5" />
                                Cases Scheduled for {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </h3>
                            <button onClick={() => setIsDayModalOpen(false)} className="p-1 hover:bg-purple-200 rounded-full transition-colors text-purple-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 bg-slate-50">
                            {selectedDayCases.map((c) => (
                                <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-wider">
                                                {c.caseNumber}
                                            </span>
                                            <h4 className="font-bold text-slate-900 mt-2 text-lg">{c.caseTitle}</h4>
                                        </div>
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                            {c.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm">
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Assigned Lawyer</p>
                                            <p className="font-medium text-slate-700 mt-1">{c.assignedLawyer}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Court Details</p>
                                            <p className="font-medium text-slate-700 mt-1">{c.court?.courtName}</p>
                                            {c.court?.location && (
                                                <p className="text-xs text-slate-500 mt-0.5">{c.court.location}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-white text-right">
                            <button 
                                onClick={() => setIsDayModalOpen(false)}
                                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
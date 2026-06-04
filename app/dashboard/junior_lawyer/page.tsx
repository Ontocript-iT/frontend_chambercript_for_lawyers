'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Note: Ensure this import path matches your project structure for fetching future cases
import { adminService } from '../../../_services/admin/adminService'; 
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

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

export default function JuniorLawyerDashboard() {
    const router = useRouter();
    const [futureCasesList, setFutureCasesList] = useState<FutureCase[]>([]);
    
    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Modal State
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [selectedDayCases, setSelectedDayCases] = useState<FutureCase[]>([]);
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);

    useEffect(() => {
        const fetchFutureCases = async () => {
            try {
                // If you have a specific service for junior lawyers, replace this call
                const result = await adminService.getFutureCases(); 
                if (result && result.data) {
                    setFutureCasesList(result.data);
                }
            } catch (err) {
                console.error("Failed to fetch future cases:", err);
            }
        };

        fetchFutureCases();
    }, []);

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
        <div className="space-y-6 max-w-7xl relative">
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">
                    Junior Lawyer Workspace
                </h1>
                <p className="text-slate-600 mt-2">Welcome to the management dashboard. Oversee case progress and team assignments here.</p>
            </div>

            {/* Calendar View */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-md flex flex-col h-[500px]">
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-blue-50">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-800" />
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
                                        ${hasCases ? 'cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200' : 'text-slate-700 hover:bg-slate-50 border border-transparent'}
                                        ${isToday && !hasCases ? 'bg-slate-100 text-amber-600 font-bold' : ''}
                                    `}
                                >
                                    {day}
                                    {hasCases && (
                                        <div className="absolute top-1 right-1 flex space-x-[2px]">
                                            {dayCases.slice(0, 3).map((_, idx) => (
                                                <span key={idx} className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span> Scheduled Hearings
                        </div>
                        <button 
                            onClick={() => router.push('/dashboard/future-cases')}
                            className="text-blue-700 hover:text-blue-900 font-semibold"
                        >
                            Open Registry
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Day Detail Modal */}
            {isDayModalOpen && selectedDay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        <div className="flex justify-between items-center p-4 border-b border-blue-200 bg-blue-50">
                            <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5" />
                                Cases Scheduled for {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </h3>
                            <button onClick={() => setIsDayModalOpen(false)} className="p-1 hover:bg-blue-200 rounded-full transition-colors text-blue-700">
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
// app/dashboard/cases/[caseId]/hearings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { hearingService } from '../../../../../_services/hearing/hearingService';
import { Hearing, AddHearingRequest } from '../../../../../models/hearing';
import { Gavel, CalendarDays, CalendarPlus, ArrowLeft, ShieldAlert, CheckCircle2, List } from 'lucide-react';

export default function CaseHearingsPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = Number(params.caseId);

    const [lawFirmCode, setLawFirmCode] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');

    // --- View State ---
    const [hearings, setHearings] = useState<Hearing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Add State ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [formData, setFormData] = useState({
        hearingDate: '',
        hearingType: 'TRIAL',
        notes: '',
        smsReminderEnabled: true
    });

    // 1. Initial Load
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setLawFirmCode(parsedUser.lawFirmCode);
        }

        if (activeTab === 'view') {
            fetchHearings();
        }
    }, [caseId, activeTab]);

    const fetchHearings = async () => {
        try {
            setIsLoading(true);
            const data = await hearingService.getHearingsByCase(caseId);
            // Sort by upcoming dates first
            const sorted = data.sort((a, b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
            setHearings(sorted);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Add Hearing Submit
    const handleAddHearing = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!lawFirmCode) return setFormError("System Error: Missing Law Firm Code. Please log in again.");

        setIsSubmitting(true);
        try {
            const payload: AddHearingRequest = {
                hearingDate: formData.hearingDate,
                hearingType: formData.hearingType,
                notes: formData.notes,
                smsReminderEnabled: formData.smsReminderEnabled,
                lawFirmCode: lawFirmCode
            };

            await hearingService.addHearing(caseId, payload);
            setFormSuccess("Hearing date scheduled successfully.");
            
            // Reset form
            setFormData({ hearingDate: '', hearingType: 'TRIAL', notes: '', smsReminderEnabled: true });
            
            // Switch back to view tab after 2 seconds
            setTimeout(() => {
                setFormSuccess('');
                setActiveTab('view');
            }, 2000);

        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return 'N/A';
        return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoString));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 relative p-4 sm:p-6">
            
            {/* Header */}
            <div>
                <button 
                    onClick={() => router.back()} 
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors mb-4 focus:outline-none"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Previous
                </button>
                <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Gavel className="w-8 h-8 text-amber-600" /> Case Hearings
                </h1>
                <p className="text-slate-500 mt-1.5">Manage scheduled court appearances and trial dates for Case</p>
            </div>

            {/* Custom Tabs */}
            <div className="bg-slate-100 p-1.5 rounded-xl inline-flex w-full sm:w-auto">
                <button 
                    onClick={() => setActiveTab('view')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'view' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <List className="w-4 h-4" /> Upcoming Hearings
                </button>
                <button 
                    onClick={() => setActiveTab('add')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'add' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <CalendarPlus className="w-4 h-4" /> Schedule New
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                
                {/* --- VIEW TAB --- */}
                {activeTab === 'view' && (
                    <div className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[400px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
                                <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
                                <p className="text-slate-800 font-medium">{error}</p>
                            </div>
                        ) : hearings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center text-slate-500 px-4">
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-full mb-5">
                                    <CalendarDays className="w-12 h-12 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800">No scheduled hearings</h3>
                                <p className="text-sm mt-1 mb-6 max-w-sm">There are no upcoming court dates set for this case.</p>
                                <button onClick={() => setActiveTab('add')} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                                    Schedule a Hearing
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {hearings.map((hearing, idx) => (
                                    <div key={hearing.id || idx} className="p-6 sm:p-8 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-6 items-start">
                                        
                                        {/* Date Box */}
                                        <div className="flex flex-col items-center justify-center bg-blue-50 border border-blue-100 rounded-xl p-4 min-w-[120px] flex-shrink-0">
                                            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                                                {new Date(hearing.hearingDate).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-3xl font-black text-slate-900 mt-1">
                                                {new Date(hearing.hearingDate).getDate()}
                                            </span>
                                            <span className="text-xs font-medium text-slate-500 mt-1">
                                                {new Date(hearing.hearingDate).getFullYear()}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 space-y-3 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                                    {hearing.hearingType.replace('_', ' ')}
                                                </div>
                                                {hearing.smsReminderEnabled && (
                                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 flex items-center gap-1.5 w-fit">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> SMS Reminder Active
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Preparation Notes</h4>
                                                <p className="text-slate-700 text-sm leading-relaxed">{hearing.notes || 'No preparation notes provided.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- ADD TAB --- */}
                {activeTab === 'add' && (
                    <div className="p-6 sm:p-10 max-w-2xl">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900">Schedule Appearance</h2>
                            <p className="text-sm text-slate-500 mt-1">Add a new hearing, trial date, or motion for this case.</p>
                        </div>

                        {formSuccess && (
                            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">{formSuccess}</span>
                            </div>
                        )}
                        
                        {formError && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleAddHearing} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hearing Date</label>
                                    <input 
                                        required 
                                        type="date" 
                                        value={formData.hearingDate} 
                                        onChange={e => setFormData({...formData, hearingDate: e.target.value})} 
                                        className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hearing Type</label>
                                    <select 
                                        value={formData.hearingType} 
                                        onChange={e => setFormData({...formData, hearingType: e.target.value})} 
                                        className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white" 
                                    >
                                        <option value="TRIAL">Trial</option>
                                        <option value="MOTION">Motion</option>
                                        <option value="PRE_TRIAL">Pre-Trial Conference</option>
                                        <option value="APPEAL">Appeal</option>
                                        <option value="BAIL_HEARING">Bail Hearing</option>
                                        <option value="SENTENCING">Sentencing</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Preparation Notes</label>
                                <textarea 
                                    required
                                    rows={4}
                                    value={formData.notes} 
                                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                                    className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                                    placeholder="Enter details about what needs to be prepared (e.g., cross-examination questions, evidence to present)..." 
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <input 
                                    type="checkbox" 
                                    id="smsReminder"
                                    checked={formData.smsReminderEnabled}
                                    onChange={e => setFormData({...formData, smsReminderEnabled: e.target.checked})}
                                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <label htmlFor="smsReminder" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Enable automated SMS reminders for the assigned client and lawyer
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-amber-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : null}
                                    {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
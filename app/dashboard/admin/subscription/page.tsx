'use client';

import { useEffect, useState } from 'react';
import { 
    Check, Zap, Shield, Loader2, AlertCircle, 
    MessageSquare, X, Info, ChevronRight, HardDrive, Users
} from 'lucide-react';
import { subscriptionService,UpdatePlanPayload } from '@/_services/subscription/subscriptionService';

interface CurrentPlanResponse {
    data?: {
        planType?: string;
        customMaxEmployees?: number;
        customMaxStorageGb?: number;
        smsPlanType?: string;
        smsPlan?: string;
        smsQuota?: number;
        [key: string]: any;
    };
    planType?: string;
    customMaxEmployees?: number;
    customMaxStorageGb?: number;
    smsPlanType?: string;
    smsPlan?: string;
    smsQuota?: number;
    [key: string]: any;
}

export default function SubscriptionPage() {
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [hasExistingPlan, setHasExistingPlan] = useState<boolean>(false);
    
    const [currentSmsPlan, setCurrentSmsPlan] = useState<string | null>(null);
    const [smsQuota, setSmsQuota] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [isSubmittingSms, setIsSubmittingSms] = useState<string | null>(null);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'PLATFORM' | 'SMS' | null;
        targetPlan: string | null;
    }>({ isOpen: false, type: null, targetPlan: null });

    const [customEmployees, setCustomEmployees] = useState<number>(15);
    const [customStorage, setCustomStorage] = useState<number>(100);

    const fetchCurrentPlan = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Using the Service
            const data = await subscriptionService.getCurrentSubscription();

            if (data) {
                const planType = data.planType || data.data?.planType; 
                const fetchedSmsPlan = data.smsPlanType || data.data?.smsPlanType || data.smsPlan || data.data?.smsPlan;
                const fetchedSmsQuota = data.smsQuota || data.data?.smsQuota;
                
                if (planType) {
                    setCurrentPlan(planType);
                    setHasExistingPlan(true);
                    if (planType === 'CUSTOM') {
                        setCustomEmployees(data.customMaxEmployees || data.data?.customMaxEmployees || 15);
                        setCustomStorage(data.customMaxStorageGb || data.data?.customMaxStorageGb || 100);
                    }
                } else {
                    setCurrentPlan(null);
                    setHasExistingPlan(false);
                }

                if (fetchedSmsPlan) {
                    setCurrentSmsPlan(fetchedSmsPlan);
                    setSmsQuota(fetchedSmsQuota || 0);
                }
            } else {
                // Returns null on 404 (no plan yet)
                setCurrentPlan(null);
                setHasExistingPlan(false);
                setCurrentSmsPlan(null);
                setSmsQuota(null);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch subscription data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentPlan();
    }, []);
 

    const initiateSelectPlan = (planType: string) => setConfirmModal({ isOpen: true, type: 'PLATFORM', targetPlan: planType });
    const initiateUpdateSmsPlan = (smsPlan: string) => setConfirmModal({ isOpen: true, type: 'SMS', targetPlan: smsPlan });

    const executePlanUpdate = async () => {
        const { type, targetPlan } = confirmModal;
        if (!targetPlan || !type) return;
        setConfirmModal({ isOpen: false, type: null, targetPlan: null });

        if (type === 'PLATFORM') await handleSelectPlan(targetPlan);
        else await handleUpdateSmsPlan(targetPlan);
    };

const handleSelectPlan = async (planType: string) => {
        setIsSubmitting(planType);
        setError('');
        setSuccessMessage('');

        const payload: UpdatePlanPayload = { planType };
        if (planType === 'CUSTOM') {
            payload.customMaxEmployees = customEmployees;
            payload.customMaxStorageGb = customStorage;
        }

        try {
            // Using the Service based on existence of current plan
            if (hasExistingPlan) {
                await subscriptionService.updateSubscription(payload);
            } else {
                await subscriptionService.chooseSubscription(payload);
            }
            
            setSuccessMessage(`Updated to ${planType} plan!`);
            await fetchCurrentPlan(); 
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err: any) {
            setError(err.message); // Will naturally catch the 400 Downgrade error message mapped in the service
        } finally {
            setIsSubmitting(null);
        }
    };

const handleUpdateSmsPlan = async (smsPlan: string) => {
        setIsSubmittingSms(smsPlan);
        setError('');
        setSuccessMessage('');

        try {
            // Using the Service
            await subscriptionService.updateSmsPlan(smsPlan);
            
            setSuccessMessage(`SMS plan updated to ${smsPlan}!`);
            await fetchCurrentPlan(); 
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err: any) {
            setError(err.message); // Will naturally catch the 400 Downgrade error message mapped in the service
        } finally {
            setIsSubmittingSms(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-100"></div>
                    <Loader2 className="w-10 h-10 text-slate-800 animate-spin absolute top-0 left-0" />
                </div>
            </div>
        );
    }

    return (
        // Master container perfectly bounded to viewport height to eliminate scrolling
        <div className="h-[calc(100vh-6rem)] w-full flex flex-col bg-slate-50/50 p-2 lg:p-6 overflow-hidden relative">
            
            {/* Header & Notifications Area (Compact) */}
            <div className="flex items-center justify-between shrink-0 mb-4 px-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Shield className="w-6 h-6 text-indigo-600" />
                        Subscription Hub
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Manage your limits and communication quotas effortlessly.</p>
                </div>
                
                {/* Notification Toasts absolute positioned top right to save space */}
                <div className="absolute top-4 right-8 z-50 flex flex-col gap-2">
                    {error && (
                        <div className="px-4 py-2 bg-white text-red-600 text-sm font-semibold rounded-full shadow-lg border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                            <Check className="w-4 h-4 text-emerald-400" /> {successMessage}
                        </div>
                    )}
                </div>
            </div>

            {/* Split Screen Content */}
            <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
                
                {/* --- LEFT: PLATFORM PLANS (60% width) --- */}
                <div className="flex-[3] flex flex-col bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-hidden">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 shrink-0">Platform Tier</h2>
                    
                    <div className="flex gap-4 flex-1 h-full min-h-0">
                        {/* Standard */}
                        <div className={`flex-1 flex flex-col rounded-2xl p-5 transition-all relative border 
                            ${currentPlan === 'STANDARD' ? 'ring-2 ring-indigo-500 bg-indigo-50/30 border-transparent shadow-sm' : 'border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md'}
                        `}>
                            {currentPlan === 'STANDARD' && <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                            <h3 className="text-lg font-bold text-slate-900">Standard</h3>
                            <p className="text-xs text-slate-500 mb-4">Independent practices.</p>
                            
                            <div className="space-y-3 mb-4 flex-1">
                                <div className="flex items-center gap-2 text-sm text-slate-700"><Users className="w-4 h-4 text-slate-400"/> 3 Accounts</div>
                                <div className="flex items-center gap-2 text-sm text-slate-700"><HardDrive className="w-4 h-4 text-slate-400"/> 20 GB Storage</div>
                                <div className="flex items-center gap-2 text-sm text-slate-700"><Check className="w-4 h-4 text-slate-400"/> 500 Records</div>
                            </div>
                            
                            <button onClick={() => initiateSelectPlan('STANDARD')} disabled={currentPlan === 'STANDARD' || isSubmitting !== null}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${currentPlan === 'STANDARD' ? 'bg-indigo-100 text-indigo-700 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900'}`}
                            >
                                {isSubmitting === 'STANDARD' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (currentPlan === 'STANDARD' ? 'Active Plan' : 'Select Standard')}
                            </button>
                        </div>

                        {/* Pro */}
                        <div className={`flex-1 flex flex-col rounded-2xl p-5 transition-all relative
                            ${currentPlan === 'PRO' ? 'bg-slate-900 text-white ring-2 ring-amber-400 shadow-xl' : 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg'}
                        `}>
                            {currentPlan === 'PRO' && <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                            <Zap className="w-5 h-5 text-amber-400 mb-1" />
                            <h3 className="text-lg font-bold">Professional</h3>
                            <p className="text-xs text-slate-400 mb-4">Growing law firms.</p>
                            
                            <div className="space-y-3 mb-4 flex-1">
                                <div className="flex items-center gap-2 text-sm text-slate-200"><Users className="w-4 h-4 text-slate-400"/> 7 Accounts</div>
                                <div className="flex items-center gap-2 text-sm text-slate-200"><HardDrive className="w-4 h-4 text-slate-400"/> 50 GB Storage</div>
                                <div className="flex items-center gap-2 text-sm text-slate-200"><Check className="w-4 h-4 text-slate-400"/> 1,500 Records</div>
                            </div>
                            
                            <button onClick={() => initiateSelectPlan('PRO')} disabled={currentPlan === 'PRO' || isSubmitting !== null}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${currentPlan === 'PRO' ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-amber-400 text-slate-900 hover:bg-amber-300'}`}
                            >
                                {isSubmitting === 'PRO' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (currentPlan === 'PRO' ? 'Active Plan' : 'Select Pro')}
                            </button>
                        </div>

                        {/* Custom */}
                        <div className={`flex-1 flex flex-col rounded-2xl p-5 transition-all relative border 
                            ${currentPlan === 'CUSTOM' ? 'ring-2 ring-indigo-500 bg-indigo-50/30 border-transparent shadow-sm' : 'border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md'}
                        `}>
                            {currentPlan === 'CUSTOM' && <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                            <h3 className="text-lg font-bold text-slate-900">Enterprise</h3>
                            <p className="text-xs text-slate-500 mb-4">Tailored limits.</p>
                            
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Accounts</label>
                                    <input type="number" min="1" value={customEmployees} onChange={(e) => setCustomEmployees(Number(e.target.value))}
                                        className="w-full h-8 px-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Storage (GB)</label>
                                    <input type="number" min="1" value={customStorage} onChange={(e) => setCustomStorage(Number(e.target.value))}
                                        className="w-full h-8 px-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                            
                            <button onClick={() => initiateSelectPlan('CUSTOM')} disabled={isSubmitting !== null}
                                className="w-full py-2.5 mt-4 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 transition-all"
                            >
                                {isSubmitting === 'CUSTOM' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (currentPlan === 'CUSTOM' ? 'Update Limits' : 'Select Enterprise')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: SMS PLANS (40% width) --- */}
                <div className="flex-[2] flex flex-col bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">SMS Quota</h2>
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {smsQuota ? smsQuota.toLocaleString() : 0} Available
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                        
                        {/* SMS Defaults Map */}
                        {[
                            { key: 'NONE', title: 'Default', quota: '100 / mo', desc: 'Included free limit' },
                            { key: 'BASIC', title: 'Basic', quota: '500 / mo', desc: 'Standard usage' },
                            { key: 'PRO', title: 'Pro', quota: '1,000 / mo', desc: 'High volume firm', highlight: true },
                            { key: 'UNLIMITED', title: 'Unlimited', quota: '2,000 / mo', desc: 'Max automation capacity' },
                        ].map((sms) => {
                            const isActive = currentSmsPlan === sms.key;
                            return (
                                <div key={sms.key} className={`flex flex-col p-4 rounded-2xl transition-all border relative
                                    ${isActive ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500 shadow-sm' 
                                    : (sms.highlight ? 'bg-gradient-to-b from-white to-slate-50 border-slate-200 hover:border-blue-300' : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-300')}
                                `}>
                                    {isActive && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500" />}
                                    
                                    <h3 className={`font-bold ${sms.highlight ? 'text-slate-900' : 'text-slate-700'} text-sm`}>{sms.title}</h3>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">{sms.desc}</p>
                                    <div className="text-lg font-black text-slate-800 mt-2 flex-1">{sms.quota}</div>
                                    
                                    <button onClick={() => initiateUpdateSmsPlan(sms.key)} disabled={isActive || isSubmittingSms !== null}
                                        className={`w-full py-2 rounded-lg text-xs font-bold transition-all mt-3
                                            ${isActive ? 'bg-blue-100 text-blue-700 cursor-not-allowed' : (sms.highlight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}
                                        `}
                                    >
                                        {isSubmittingSms === sms.key ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : (isActive ? 'Active' : 'Select')}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>

            {/* --- CONFIRMATION MODAL (Glassmorphic) --- */}
            {confirmModal.isOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200 rounded-3xl">
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-[360px] p-6 animate-in zoom-in-95 duration-200 border border-white/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-xl ${confirmModal.type === 'PLATFORM' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Info className="w-5 h-5" />
                            </div>
                            <button onClick={() => setConfirmModal({ isOpen: false, type: null, targetPlan: null })} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Update</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Change your <strong className="text-slate-700">{confirmModal.type === 'PLATFORM' ? 'Platform' : 'SMS'}</strong> plan to <strong className="text-slate-900">{confirmModal.targetPlan}</strong>?
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmModal({ isOpen: false, type: null, targetPlan: null })} className="flex-1 py-2.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl">Cancel</button>
                            <button onClick={executePlanUpdate} className={`flex-1 py-2.5 text-sm text-white font-bold rounded-xl flex justify-center items-center gap-1 group
                                ${confirmModal.type === 'PLATFORM' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-blue-600 hover:bg-blue-700'}
                            `}>
                                Confirm <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
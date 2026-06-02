// app/dashboard/admin/subscription/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Check, Star, Zap, Shield, Loader2, AlertCircle } from 'lucide-react';

interface CurrentPlanResponse {
    planType?: string;
    customMaxEmployees?: number;
    customMaxStorageGb?: number;
    [key: string]: any;
}

export default function SubscriptionPage() {
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [hasExistingPlan, setHasExistingPlan] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // Tracks which plan button is loading
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // Custom Plan Inputs
    const [customEmployees, setCustomEmployees] = useState<number>(15);
    const [customStorage, setCustomStorage] = useState<number>(100);

    const fetchCurrentPlan = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/subscriptions/current', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data: CurrentPlanResponse = await response.json();
                // Depending on your API, the plan type might be directly in 'data' or nested.
                const planType = data.planType || data.data?.planType; 
                
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
            } else if (response.status === 404) {
                // No plan selected yet
                setCurrentPlan(null);
                setHasExistingPlan(false);
            } else {
                throw new Error('Failed to load current subscription.');
            }
        } catch (err: any) {
            console.error("Fetch Plan Error:", err);
            // Optionally set error, but 404 is normal for new users
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentPlan();
    }, []);

    const handleSelectPlan = async (planType: string) => {
        setIsSubmitting(planType);
        setError('');
        setSuccessMessage('');

        const token = localStorage.getItem('token');
        
        // Decide endpoint and method based on if user already has a plan
        const url = hasExistingPlan 
            ? 'http://localhost:8080/api/subscriptions/update'
            : 'http://localhost:8080/api/subscriptions/choose';
            
        // Use PUT for update, POST for choose
        const method = hasExistingPlan ? 'PUT' : 'POST';

        const payload: any = { planType };
        if (planType === 'CUSTOM') {
            payload.customMaxEmployees = customEmployees;
            payload.customMaxStorageGb = customStorage;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Failed to update subscription.');
            }

            setSuccessMessage(`Successfully updated to ${planType} plan!`);
            await fetchCurrentPlan(); // Refresh data to show active state
            
            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">
                    Manage Subscription
                </h1>
                <p className="text-slate-600 mt-2">
                    Choose the plan that fits your law firm's size and needs. Upgrade or adjust your storage and seats at any time.
                </p>
            </div>

            {/* Notifications */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}
            
            {successMessage && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 border border-emerald-200">
                    <Check className="w-5 h-5" />
                    <p>{successMessage}</p>
                </div>
            )}

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                
                {/* STANDARD PLAN */}
                <div className={`relative flex flex-col bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 ${currentPlan === 'STANDARD' ? 'border-amber-500 shadow-amber-500/20 shadow-lg scale-105 z-10' : 'border-slate-200 hover:border-slate-300'}`}>
                    {currentPlan === 'STANDARD' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Current Plan
                        </div>
                    )}
                    <div className="p-8 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-slate-500" />
                            <h3 className="text-xl font-bold text-slate-900">Standard</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-6">Perfect for small practices just getting started.</p>
                        
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-700 text-sm">Max <strong className="text-slate-900">3 Accounts</strong> (Lawyers/Clerks)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-700 text-sm"><strong className="text-slate-900">20 GB</strong> Document Storage</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-700 text-sm">Up to <strong className="text-slate-900">500 Records</strong> (Clients + Cases)</span>
                            </li>
                        </ul>
                    </div>
                    <div className="p-8 pt-0 mt-auto">
                        <button
                            onClick={() => handleSelectPlan('STANDARD')}
                            disabled={currentPlan === 'STANDARD' || isSubmitting !== null}
                            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex justify-center items-center gap-2
                                ${currentPlan === 'STANDARD' 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                    : 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
                                }
                            `}
                        >
                            {isSubmitting === 'STANDARD' ? <Loader2 className="w-5 h-5 animate-spin" /> : (currentPlan === 'STANDARD' ? 'Active' : 'Choose Standard')}
                        </button>
                    </div>
                </div>

                {/* PRO PLAN */}
                <div className={`relative flex flex-col bg-slate-900 rounded-2xl shadow-sm border-2 transition-all duration-300 ${currentPlan === 'PRO' ? 'border-amber-500 shadow-amber-500/20 shadow-lg scale-105 z-10' : 'border-slate-800'}`}>
                    {currentPlan === 'PRO' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Current Plan
                        </div>
                    )}
                    <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-500 p-1.5 rounded-lg">
                        <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div className="p-8 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <h3 className="text-xl font-bold text-white">Professional</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">Built for growing law firms requiring more power.</p>
                        
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="text-slate-300 text-sm">Max <strong className="text-white">7 Accounts</strong> (Lawyers/Clerks)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="text-slate-300 text-sm"><strong className="text-white">50 GB</strong> Document Storage</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="text-slate-300 text-sm">Up to <strong className="text-white">1,500 Records</strong> (Clients + Cases)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="text-slate-300 text-sm"><strong className="text-white">Generate Reports</strong> & Analytics</span>
                            </li>
                        </ul>
                    </div>
                    <div className="p-8 pt-0 mt-auto">
                        <button
                            onClick={() => handleSelectPlan('PRO')}
                            disabled={currentPlan === 'PRO' || isSubmitting !== null}
                            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex justify-center items-center gap-2
                                ${currentPlan === 'PRO' 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                    : 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                                }
                            `}
                        >
                            {isSubmitting === 'PRO' ? <Loader2 className="w-5 h-5 animate-spin" /> : (currentPlan === 'PRO' ? 'Active' : 'Choose Pro')}
                        </button>
                    </div>
                </div>

                {/* CUSTOM PLAN */}
                <div className={`relative flex flex-col bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 ${currentPlan === 'CUSTOM' ? 'border-amber-500 shadow-amber-500/20 shadow-lg scale-105 z-10' : 'border-slate-200 hover:border-slate-300'}`}>
                    {currentPlan === 'CUSTOM' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Current Plan
                        </div>
                    )}
                    <div className="p-8 flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Custom / Enterprise</h3>
                        <p className="text-slate-500 text-sm mb-6">Need to talk? Tailor a plan specifically for your enterprise demands.</p>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Max Employees</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={customEmployees}
                                    onChange={(e) => setCustomEmployees(Number(e.target.value))}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Storage Needed (GB)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={customStorage}
                                    onChange={(e) => setCustomStorage(Number(e.target.value))}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-slate-600 text-sm">Unlimited Records</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-slate-600 text-sm">Dedicated Account Manager</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-slate-600 text-sm">Priority Support SLA</span>
                            </li>
                        </ul>
                    </div>
                    <div className="p-8 pt-0 mt-auto">
                        <button
                            onClick={() => handleSelectPlan('CUSTOM')}
                            disabled={isSubmitting !== null}
                            className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex justify-center items-center gap-2 bg-slate-100 text-slate-800 hover:bg-slate-200"
                        >
                            {isSubmitting === 'CUSTOM' ? <Loader2 className="w-5 h-5 animate-spin" /> : (currentPlan === 'CUSTOM' ? 'Update Limits' : 'Choose Custom')}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
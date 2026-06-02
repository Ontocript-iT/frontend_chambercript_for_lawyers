'use client';

import { useState } from 'react';
import { Check, Star, Zap, Shield } from 'lucide-react';
import LoginForm from '../_components/auth/login/page'; // Adjust the import path if necessary
import RegisterForm from '../_components/auth/register/page'; // Adjust the import path if necessary

export default function HomePage() {
    // State to manage which component is currently visible
    const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register'>('landing');

    // Helper to store the selected plan in local storage and navigate to registration
    const handleSelectPlan = (planType: 'STANDARD' | 'PRO' | 'CUSTOM') => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedPlan', planType);
        }
        setCurrentView('register');
    };

    // Render the Login Component
    if (currentView === 'login') {
        return (
            <div className="relative">
                <button 
                    onClick={() => setCurrentView('landing')}
                    className="absolute top-6 left-6 text-blue-900 hover:text-amber-600 font-medium transition-colors"
                >
                    &larr; Back to Home
                </button>
                <LoginForm />
            </div>
        );
    }

    // Render the Register Component
    if (currentView === 'register') {
        return (
            <div className="relative">
                <button 
                    onClick={() => setCurrentView('landing')}
                    className="absolute top-6 left-6 text-blue-900 hover:text-amber-600 font-medium transition-colors"
                >
                    &larr; Back to Home
                </button>
                <RegisterForm />
            </div>
        );
    }

    // Default Landing Page View
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 py-12">
            
            <div className="max-w-6xl w-full space-y-20">
                {/* Hero Section */}
                <div className="text-center mt-10">
                    <h1 className="text-5xl font-serif text-blue-900 font-bold mb-4">
                        Chaambffb for law
                    </h1>
                    <p className="text-xl text-blue-900/80 mb-8 max-w-2xl mx-auto">
                        Secure Partner Portal & Administrator Registration. Manage your legal cases with precision, confidentiality, and excellence.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                        <button
                            onClick={() => setCurrentView('login')}
                            className="px-8 py-3 border border-transparent text-base font-medium rounded-sm text-white bg-blue-900 hover:bg-amber-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 w-full sm:w-auto"
                        >
                            Access Portal (Login)
                        </button>
                        
                        <button
                            onClick={() => handleSelectPlan('STANDARD')}
                            className="px-8 py-3 border-2 border-blue-900 text-base font-medium rounded-sm text-blue-900 bg-transparent hover:bg-blue-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 w-full sm:w-auto"
                        >
                            Start 14 Days Free Trial
                        </button>
                    </div>
                </div>

                {/* Subscription Plans Section */}
                <div className="space-y-12">
                    <div className="text-center">
                        <h2 className="text-3xl font-serif font-bold text-blue-900">
                            Transparent Pricing
                        </h2>
                        <p className="text-blue-900/70 mt-2">
                            Choose the plan that fits your law firm's size. All plans start with a 14-day free trial.
                        </p>
                    </div>

                    {/* Pricing Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* STANDARD PLAN */}
                        <div className="relative flex flex-col bg-white rounded-2xl shadow-sm border-2 border-slate-200 hover:border-slate-300 transition-all duration-300">
                            <div className="p-8 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-5 h-5 text-slate-500" />
                                    <h3 className="text-xl font-bold text-slate-900">Standard</h3>
                                </div>
                                <p className="text-slate-500 text-sm mb-4">Perfect for small practices just getting started.</p>
                                
                                {/* Price Display */}
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-slate-900">RS 6,000</span>
                                    <span className="text-slate-500 text-sm"> / month</span>
                                </div>

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
                                    className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 bg-white border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                                >
                                    Start Free Trial
                                </button>
                            </div>
                        </div>

                        {/* PRO PLAN */}
                        <div className="relative flex flex-col bg-slate-900 rounded-2xl shadow-lg border-2 border-slate-800 transition-all duration-300 transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                Most Popular
                            </div>
                            <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-500 p-1.5 rounded-lg">
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <div className="p-8 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    <h3 className="text-xl font-bold text-white">Professional</h3>
                                </div>
                                <p className="text-slate-400 text-sm mb-4">Built for growing law firms requiring more power.</p>
                                
                                {/* Price Display */}
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-white">RS 9,000</span>
                                    <span className="text-slate-400 text-sm"> / month</span>
                                </div>

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
                                    className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                                >
                                    Start Free Trial
                                </button>
                            </div>
                        </div>

                        {/* CUSTOM PLAN */}
                        <div className="relative flex flex-col bg-white rounded-2xl shadow-sm border-2 border-slate-200 hover:border-slate-300 transition-all duration-300">
                            <div className="p-8 flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Custom / Enterprise</h3>
                                <p className="text-slate-500 text-sm mb-4">Tailor a plan specifically for your enterprise demands.</p>
                                
                                {/* Price Display */}
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-slate-900">RS 15,000+</span>
                                    <span className="text-slate-500 text-sm"> / month</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="text-slate-700 text-sm"><strong className="text-slate-900">Custom</strong> Employees & Storage</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="text-slate-700 text-sm"><strong className="text-slate-900">Unlimited</strong> Records</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="text-slate-700 text-sm">Dedicated Account Manager</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="text-slate-700 text-sm">Priority Support SLA</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="p-8 pt-0 mt-auto">
                                <button
                                    onClick={() => handleSelectPlan('CUSTOM')}
                                    className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
                                >
                                    Contact Sales
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full max-w-6xl mt-16 pt-8 border-t border-slate-300 text-center">
                <p className="text-sm text-blue-900/60 pb-8">
                    &copy; {new Date().getFullYear()} Justice & Associates Law Firm Software. All rights reserved.
                </p>
            </div>
        </div>
    );
}
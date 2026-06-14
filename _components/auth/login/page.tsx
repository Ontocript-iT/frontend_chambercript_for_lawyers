'use client';

import { useState } from 'react';
import { authService } from '../../../_services/auth/authService';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, ArrowRight,AlertTriangle,X } from 'lucide-react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const res = await authService.login(email, password);
            console.log('Login successful:', res.message);
     if (res.isSendSms === false) { 
                setShowWarningModal(true);
                setIsLoading(false);
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid login credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleProceedToDashboard = () => {
        setShowWarningModal(false);
        setIsLoading(true);
        router.push('/dashboard/admin/subscription');
    };

    return (
        <div className="w-full">
            <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Please enter your credentials to securely access the partner portal.
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-lg text-sm flex items-start gap-2 mb-6 bg-red-50 text-red-700 border border-red-100 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                </div>
            )}
       
            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                            placeholder="partner@lawfirm.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-md shadow-blue-600/20 disabled:opacity-70 disabled:shadow-none flex justify-center items-center mt-2 group"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            Secure Sign In
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>
{/* Warning Modal Overlay */}
            {showWarningModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2 text-yellow-600">
                                <AlertTriangle className="w-5 h-5" />
                                <h3 className="font-semibold text-slate-900">Action Required</h3>
                            </div>
                            <button 
                                onClick={handleProceedToDashboard}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-6">
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Your SMS quota is over. Please update your plan to continue sending SMS messages to your clients. 
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={handleProceedToDashboard}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProceedToDashboard}
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Continue to Update Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
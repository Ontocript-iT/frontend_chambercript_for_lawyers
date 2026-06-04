'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoginForm from '../_components/auth/login/page';
import { Scale, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, Mail } from 'lucide-react';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// 1. Rename your main logic to an inner component
function HomeContent() {
    const router = useRouter();
    
    // Now this is safe because its parent (HomePage) wraps it in Suspense
    const searchParams = useSearchParams();
    
    // State to manage which component is currently visible in the right panel
    const [currentView, setCurrentView] = useState<'login' | 'forgot-password' | 'reset-password'>('login');
    
    // Forgot Password States
    const [forgotEmail, setForgotEmail] = useState('');
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' });

    // Reset Password States
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetLoading, setIsResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState({ type: '', text: '' });

    // Check URL for reset token on mount
    useEffect(() => {
        const token = searchParams?.get('token');
        if (token) {
            setResetToken(token);
            setCurrentView('reset-password');
        }
    }, [searchParams]);

    // Handle Forgot Password Submit
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsForgotLoading(true);
        setForgotMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => null);
                throw new Error(err?.message || 'Failed to send reset link. Please try again.');
            }

            setForgotMessage({ type: 'success', text: 'Password reset link has been sent to your email.' });
            setForgotEmail(''); // Clear input
        } catch (err: any) {
            setForgotMessage({ type: 'error', text: err.message });
        } finally {
            setIsForgotLoading(false);
        }
    };

    // Handle Reset Password Submit
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetLoading(true);
        setResetMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setResetMessage({ type: 'error', text: 'Passwords do not match.' });
            setIsResetLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, newPassword: newPassword })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => null);
                throw new Error(err?.message || 'Failed to reset password. The link might be expired.');
            }

            setResetMessage({ type: 'success', text: 'Password successfully reset. You can now log in.' });
            setNewPassword('');
            setConfirmPassword('');
            
            // Redirect to login after a short delay
            setTimeout(() => {
                router.replace('/'); // Clean URL
                setCurrentView('login');
            }, 3000);

        } catch (err: any) {
            setResetMessage({ type: 'error', text: err.message });
        } finally {
            setIsResetLoading(false);
        }
    };

    return (
        <main className="flex h-screen w-full bg-white font-sans text-slate-900 overflow-hidden">
            
            {/* LEFT PANEL: 3/5 Width - System Branding */}
            <section className="hidden lg:flex flex-col justify-between w-3/5 bg-slate-950 text-white p-10 lg:p-14 relative h-full">
                
                {/* Modern Decorative Ambient Orbs */}
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
                <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none transform -translate-y-1/2"></div>
                <div className="absolute -bottom-32 left-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full justify-center">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Scale className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-serif font-bold tracking-wide">Chambercript for Lawyers</span>
                    </div>

                    <div className="max-w-2xl">
                        <h1 className="text-4xl lg:text-5xl font-serif font-medium leading-[1.15] mb-6">
                            Justice & Excellence,<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-200">Streamlined.</span>
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed font-light mb-10 max-w-xl">
                            A secure, state-of-the-art partner portal designed for modern law firms. Manage cases, track hearings, and collaborate with absolute confidentiality.
                        </p>

                        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 mt-8">
                            <div>
                                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Bank-Level Security
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    End-to-end encryption ensuring your client records and legal documents remain strictly confidential.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Real-Time Sync
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Instant synchronization of court dates, filings, and internal task delegations across your firm.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-slate-500 text-xs font-medium tracking-wide mt-auto pt-6">
                    &copy; {new Date().getFullYear()} Justice & Associates. All rights reserved.
                </div>
            </section>

            {/* RIGHT PANEL: 2/5 Width - Auth Portal */}
            <section className="w-full lg:w-2/5 flex flex-col justify-center items-center p-6 lg:p-10 relative z-20 bg-white shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.05)] h-full overflow-y-auto">
                <div className="w-full max-w-[380px] my-auto">
                    
                    {/* View: LOGIN */}
                    {currentView === 'login' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Mobile only branding */}
                            <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <Scale className="text-white w-5 h-5" />
                                </div>
                                <span className="text-2xl font-serif font-bold text-slate-900">Chambercript</span>
                            </div>

                            <LoginForm />
                            
                            <div className="mt-2 text-center">
                                <button 
                                    onClick={() => setCurrentView('forgot-password')}
                                    className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors hover:underline"
                                >
                                    Forgot your password?
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View: FORGOT PASSWORD */}
                    {currentView === 'forgot-password' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-6 text-center">
                                <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <KeyRound className="w-7 h-7" />
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Reset Password</h2>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Enter your registered email address to receive secure reset instructions.
                                </p>
                            </div>

                            {forgotMessage.text && (
                                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 mb-6 ${forgotMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                    {forgotMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5"/> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>}
                                    <span className="leading-relaxed">{forgotMessage.text}</span>
                                </div>
                            )}

                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input 
                                            type="email" 
                                            required
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                                            placeholder="partner@lawfirm.com"
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isForgotLoading}
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-md shadow-blue-600/20 disabled:opacity-70 disabled:shadow-none flex justify-center items-center"
                                >
                                    {isForgotLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Send Reset Link'}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <button 
                                    onClick={() => setCurrentView('login')}
                                    className="text-sm text-slate-500 hover:text-slate-900 font-semibold transition-colors flex items-center justify-center gap-1.5 mx-auto"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View: RESET PASSWORD (Accessed via Email Link) */}
                    {currentView === 'reset-password' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-6 text-center">
                                <div className="mx-auto w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
                                    <KeyRound className="w-7 h-7" />
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Create New Password</h2>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Please enter and confirm your new password below.
                                </p>
                            </div>

                            {resetMessage.text && (
                                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 mb-6 ${resetMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                    {resetMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5"/> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>}
                                    <span className="leading-relaxed">{resetMessage.text}</span>
                                </div>
                            )}

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        minLength={8}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        minLength={8}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isResetLoading || resetMessage.type === 'success'}
                                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-md shadow-amber-500/20 disabled:opacity-70 disabled:shadow-none flex justify-center items-center mt-2"
                                >
                                    {isResetLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm Password'}
                                </button>
                            </form>

                            {resetMessage.type !== 'success' && (
                                <div className="mt-8 text-center">
                                    <button 
                                        onClick={() => {
                                            router.replace('/'); 
                                            setCurrentView('login');
                                        }}
                                        className="text-sm text-slate-500 hover:text-slate-900 font-semibold transition-colors flex items-center justify-center gap-1.5 mx-auto"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" /> Return to login
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </section>
        </main>
    );
}

// 2. Export a clean wrapper component that contains the Suspense boundary
export default function HomePage() {
    return (
        // I created a nice full-screen loading state so it doesn't look broken while Next.js loads the client bundle
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}
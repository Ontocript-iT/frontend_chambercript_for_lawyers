"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/_services/auth/authService';

const ResetPasswordForm = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // UI States matching the reference structure
    const [isResetLoading, setIsResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState({ type: '', text: '' });

    // Extract token using Next.js useSearchParams
    useEffect(() => {
        const extractedToken = searchParams.get('token');

        if (extractedToken) {
            setToken(extractedToken);
        } else {
            setResetMessage({ 
                type: 'error', 
                text: 'Invalid or missing reset token. Please request a new password reset link.' 
            });
        }
    }, [searchParams]);

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetLoading(true);
        setResetMessage({ type: '', text: '' });

        // Validation
        if (!token) {
            setResetMessage({ type: 'error', text: 'Missing token. Cannot reset password.' });
            setIsResetLoading(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setResetMessage({ type: 'error', text: 'Passwords do not match.' });
            setIsResetLoading(false);
            return;
        }
        if (newPassword.length < 8) {
            setResetMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
            setIsResetLoading(false);
            return;
        }

        // API Call
        try {
            await authService.resetPassword(token, newPassword);
            setResetMessage({ 
                type: 'success', 
                text: 'Password successfully reset. Redirecting to login...' 
            });
            setNewPassword('');
            setConfirmPassword('');
            
            // Redirect to login after a 3-second delay
            setTimeout(() => {
                // Adjust this route if your login page is somewhere else (e.g., '/login')
                router.replace('/'); 
            }, 3000);

        } catch (err: any) {
            setResetMessage({ 
                type: 'error', 
                text: err.message || 'Failed to reset password. The link might be expired.' 
            });
        } finally {
            setIsResetLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[380px] mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header Content */}
            <div className="mb-6 text-center">
                <div className="mx-auto w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
                    <KeyRound className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Create New Password</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Please enter and confirm your new password below.
                </p>
            </div>

            {/* Status Messages */}
            {resetMessage.text && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 mb-6 ${resetMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {resetMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5"/> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>}
                    <span className="leading-relaxed">{resetMessage.text}</span>
                </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
                
                {/* New Password Field */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={handleTogglePassword}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Confirm New Password Field */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                        placeholder="••••••••"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isResetLoading || resetMessage.type === 'success' || !token}
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-md shadow-amber-500/20 disabled:opacity-70 disabled:shadow-none flex justify-center items-center mt-2"
                >
                    {isResetLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm Password'}
                </button>
            </form>

            {/* Back to Login Link */}
            {resetMessage.type !== 'success' && (
                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push('/')} // Adjust this route if your login page is somewhere else
                        className="text-sm text-slate-500 hover:text-slate-900 font-semibold transition-colors flex items-center justify-center gap-1.5 mx-auto"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Return to login
                    </button>
                </div>
            )}
        </div>
    );
};

// Wrapper Component with Suspense boundary to handle Next.js useSearchParams requirements
export default function ResetPasswordPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-white p-6">
            <Suspense fallback={
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
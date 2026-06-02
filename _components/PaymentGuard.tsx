// components/PaymentGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, MessageCircle, Mail, ArrowRight } from 'lucide-react';

export default function PaymentGuard({ children }: { children: React.ReactNode }) {
    const [isBlocked, setIsBlocked] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('isPaymentCompleted');
        router.push('/');
    };

    useEffect(() => {
        const checkPaymentStatus = () => {
            const userStr = localStorage.getItem('user');
            const isPaymentCompleted = localStorage.getItem('isPaymentCompleted');

            // Your requested debug log
            console.log('Login successful11:', isPaymentCompleted); 

            if (userStr) {
                const user = JSON.parse(userStr);
                
                // Exclude Super Admin from the check
                if (user.role !== 'SUPER_ADMIN' && user.role !== 'ROLE_SUPER_ADMIN') {
                    // Check if payment is false
                    if (isPaymentCompleted === 'false' || !isPaymentCompleted) {
                        setIsBlocked(true);
                    }
                }
            }
            setIsChecking(false);
        };

        checkPaymentStatus();
    }, []);

    // Prevent screen flickering while checking local storage
    if (isChecking) return null; 

    // If payment is pending, blur the dashboard and show the popup
    if (isBlocked) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-slate-50">
                
                {/* Blurred Dashboard Background */}
                <div className="blur-md opacity-40 pointer-events-none select-none h-screen overflow-hidden">
                    {children}
                </div>

                {/* Warning Overlay Popup */}
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Top Accent Line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-500" />

                <div className="p-8">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-red-100/50">
                        <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                        Payment Required
                    </h2>
                    <p className="text-slate-600 mb-6 leading-relaxed text-sm sm:text-base">
                        Your law firm's subscription payment for this month is currently pending. Access to the portal has been temporarily paused.
                    </p>

                    {/* Structured Contact Block */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-200/60">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Need Help? Contact Support
                        </p>
                        <div className="space-y-3">
                            {/* WhatsApp Link */}
                            <a 
                                href="https://wa.me/07012345678" 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center text-sm text-slate-700 hover:text-emerald-600 transition-colors group"
                            >
                                <MessageCircle className="w-4 h-4 mr-3 text-emerald-500 group-hover:text-emerald-600" />
                                +070 1234 5678
                            </a>
                            {/* Email Link */}
                            <a 
                                href="mailto:admin@yourdomain.com" 
                                className="flex items-center text-sm text-slate-700 hover:text-blue-600 transition-colors group"
                            >
                                <Mail className="w-4 h-4 mr-3 text-blue-500 group-hover:text-blue-600" />
                                admin@yourdomain.com
                            </a>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center group py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all active:scale-[0.98]"
                    >
                        Return to Login
                        <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                </div>
            </div>
        </div>
            </div>
        );
    }

    // If payment is true (or user is Super Admin), render dashboard normally
    return <>{children}</>;
}
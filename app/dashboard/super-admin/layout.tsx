// app/dashboard/super-admin/layout.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Building, CreditCard, ArrowLeft } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const isDirectoryPage = pathname.includes('/directory');

    const tabs = [
        { id: 'subscriptions', label: 'Law Firm Subscriptions', icon: Building, href: '/dashboard/super-admin/subscriptions' },
        { id: 'payments', label: 'Payment Tracker', icon: CreditCard, href: '/dashboard/super-admin/payments' }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 relative p-4 sm:p-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Shield className="w-8 h-8 text-indigo-600" /> Super Admin Portal
                </h1>
                <p className="text-slate-500 mt-1.5">Manage global law firm subscriptions, payments, and directories.</p>
            </div>

            {/* If on Directory Page, show Back button, otherwise show Tabs */}
            {isDirectoryPage ? (
                <button 
                    onClick={() => router.push('/dashboard/super-admin/subscriptions')}
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    
                </button>
            ) : (
                <div className="bg-slate-100 p-1.5 rounded-xl inline-flex w-full sm:w-auto overflow-x-auto shadow-inner">
                    {tabs.map((tab) => {
                        // FIXED: Use exact match (===) so other pages don't trigger the highlight
                        const isActive = pathname === tab.href;
                        const Icon = tab.icon;
                        
                        return (
                            <Link 
                                key={tab.id}
                                href={tab.href}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                            >
                                <Icon className="w-4 h-4" /> {tab.label}
                            </Link>
                        );
                    })}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                {children}
            </div>
        </div>
    );
}
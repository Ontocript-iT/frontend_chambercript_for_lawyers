// app/settings/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShieldCheck } from 'lucide-react';
import Sidebar from '../../_components/shared/side-navBar/Sidebar'; // Adjust path if your components folder is elsewhere

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const TABS = [
        { name: 'Profile Details', href: '/settings/profile', icon: User },
        { name: 'Change Password', href: '/settings/security', icon: ShieldCheck },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* 1. Add the Sidebar here so it stays visible */}
            <Sidebar />

            {/* 2. Main Content Area */}
            <main className="flex-1 p-6 md:p-12 font-sans text-slate-900 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">Account Settings</h1>
                        <p className="text-slate-500 mt-1">Manage your personal information and security preferences.</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-8">
                            {TABS.map((tab) => {
                                const isActive = pathname === tab.href;
                                const Icon = tab.icon;
                                return (
                                    <Link
                                        key={tab.name}
                                        href={tab.href}
                                        className={`
                                            group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                            ${isActive 
                                                ? 'border-amber-500 text-amber-600' 
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        {tab.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Sub-page Content renders here */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        {children}
                    </div>

                </div>
            </main>
        </div>
    );
}
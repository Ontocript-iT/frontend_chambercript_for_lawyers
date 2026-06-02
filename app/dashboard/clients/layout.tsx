// app/dashboard/clients/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, UserPlus } from 'lucide-react';

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const TABS = [
        //    { name: 'Register New Client', href: '/dashboard/clients/register', icon: UserPlus },
        { name: 'Client Directory', href: '/dashboard/clients/view', icon: Users },
     
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">Client Management</h1>
                <p className="text-slate-500 mt-1">Register and manage firm clients, contact details, and secure access.</p>
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

            {/* Content renders here (Register Form or Table View) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                {children}
            </div>
        </div>
    );
}
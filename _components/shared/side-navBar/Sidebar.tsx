// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '../../../models/auth'; // Adjust path if needed
import { 
    LayoutDashboard, 
    Briefcase, 
    Users, 
    UserPlus, 
    FileText, 
    Settings, 
    LogOut,
    Scale,
    ChevronRight,
    ChevronDown,
    CircleDot,
    CheckSquare,
    CreditCard,
    Shield
} from 'lucide-react';

const NAV_GROUPS = [
    {
        label: 'Dashboards',
        items: [
            { name: 'Admin Overview', href: '/dashboard/admin', roles: ['ADMIN'], icon: LayoutDashboard },
            { name: 'Junior Lawyer Overview', href: '/dashboard/junior_lawyer', roles: ['JUNIOR_LAWYER'], icon: LayoutDashboard },
            { name: 'Clerk Overview', href: '/dashboard/clerk', roles: ['CLERK'], icon: LayoutDashboard },
        ]
    },
    {
        label: 'Workspace',
        items: [
            { name: 'Client Management', href: '/dashboard/clients/view', roles: ['ADMIN', 'JUNIOR_LAWYER', 'CLERK'], icon: Users },            
            { name: 'Case Register', href: '/dashboard/cases/register', roles: ['ADMIN', 'JUNIOR_LAWYER', 'CLERK'], icon: Briefcase },
            { name: 'Task Center', href: '/dashboard/tasks', roles: ['ADMIN', 'MANAGER', 'CLERK', 'JUNIOR_LAWYER'], icon: CheckSquare },
            { name: 'Reports', href: '/dashboard/reports', roles: ['ADMIN', 'JUNIOR_LAWYER'], icon: FileText },
        ]
    },
    {
        label: 'Administration',
        items: [
            { 
                name: 'User Management', 
                roles: ['ADMIN'], 
                icon: Users,
                subItems: [
                    { name: 'Register Employee', href: '/dashboard/admin/users/register', roles: ['ADMIN'] },
                     { name: 'Employees', href: '/dashboard/admin/users/employee', roles: ['ADMIN'] },
                ]
            },
            { name: 'Subscription', href: '/dashboard/admin/subscription', roles: ['ADMIN'], icon: CreditCard },
            { name: 'Settings', href: '/settings/profile', roles: ['ADMIN', 'JUNIOR_LAWYER', 'CLERK'], icon: Settings },
        ]
    },
    {
        label: 'Administration',
        items: [
            { 
                name: 'Subscription Management', 
                href: '/dashboard/super-admin', 
                roles: ['SUPER_ADMIN'], 
                icon: CreditCard,
            },
            { 
                name: 'Firm Directory', 
                href: '/dashboard/super-admin/directory', 
                roles: ['SUPER_ADMIN'],
                icon: Users 
            },
             { 
                name: 'Register Firm', 
                href: '/dashboard/super-admin/register', 
                roles: ['SUPER_ADMIN'],
                icon: Users 
            },
              
        ]
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    
    // State to track which dropdowns are currently open
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Auto-open dropdowns if a sub-item is the active page
        const initialDropdownState: Record<string, boolean> = {};
        NAV_GROUPS.forEach(group => {
            group.items.forEach(item => {
                if (item.subItems) {
                    const isAnySubActive = item.subItems.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`));
                    if (isAnySubActive) {
                        initialDropdownState[item.name] = true;
                    }
                }
            });
        });
        setOpenDropdowns(initialDropdownState);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    const toggleDropdown = (itemName: string) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    if (!user) return null;

    return (
        <aside className="w-72 h-screen flex flex-col bg-slate-950 text-slate-300 border-r border-slate-800/60 font-sans selection:bg-amber-500/30">
            {/* Header / Brand Area */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-900/20">
                        <Scale className="w-5 h-5 text-slate-50" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-serif font-bold text-slate-50 tracking-wide leading-tight">
                            Chambercript
                        </span>
                        <span className="text-[10px] font-medium text-amber-500/80 uppercase tracking-widest">
                            for Lawyers
                        </span>
                    </div>
                </div>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {NAV_GROUPS.map((group, groupIdx) => {
                    const allowedItems = group.items.filter(item => item.roles.includes(user.role));
                    if (allowedItems.length === 0) return null;

                    return (
                        <div key={groupIdx} className="space-y-1">
                            <h3 className="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                {group.label}
                            </h3>
                            <nav className="space-y-1">
                                {allowedItems.map((item) => {
                                    const Icon = item.icon;

                                    // Render Dropdown if subItems exist
                                    if (item.subItems) {
                                        const isOpen = openDropdowns[item.name];
                                        const isAnySubActive = item.subItems.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`));

                                        return (
                                            <div key={item.name} className="flex flex-col">
                                                <button 
                                                    onClick={() => toggleDropdown(item.name)}
                                                    className={`
                                                        group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 w-full
                                                        ${isAnySubActive && !isOpen ? 'text-amber-500 bg-slate-800/40' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon 
                                                            className={`w-5 h-5 transition-colors duration-200 ${isAnySubActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`} 
                                                            strokeWidth={1.75} 
                                                        />
                                                        <span>{item.name}</span>
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-300' : 'text-slate-500'}`} />
                                                </button>

                                                {/* Dropdown Content with smooth animation */}
                                                <div className={`
                                                    overflow-hidden transition-all duration-300 ease-in-out
                                                    ${isOpen ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                                                `}>
                                                    <div className="flex flex-col space-y-1 pl-11 pr-2 pb-2 border-l-2 border-slate-800/60 ml-5 mt-1">
                                                        {item.subItems.filter(sub => sub.roles.includes(user.role)).map(sub => {
                                                            const isSubActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                                                            return (
                                                                <Link 
                                                                    key={sub.name} 
                                                                    href={sub.href}
                                                                    className={`
                                                                        flex items-center gap-2 py-2 px-3 text-[13px] font-medium rounded-md transition-all duration-200
                                                                        ${isSubActive 
                                                                            ? 'text-amber-500 bg-amber-500/10' 
                                                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                                                        }
                                                                    `}
                                                                >
                                                                    <CircleDot className={`w-3 h-3 ${isSubActive ? 'text-amber-500' : 'text-slate-600'}`} />
                                                                    {sub.name}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Render Standard Link (No Sub Items)
                                    // FIXED ACTIVE LOGIC: Prevent 'Firm Directory' from highlighting 'Subscription Management'
                                    let isActive = false;
                                    if (item.name === 'Subscription Management') {
                                        isActive = pathname === '/dashboard/super-admin' || 
                                                   pathname.startsWith('/dashboard/super-admin/subscriptions') || 
                                                   pathname.startsWith('/dashboard/super-admin/payments');
                                    } else {
                                        isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                    }

                                    return (
                                        <Link 
                                            key={item.name} 
                                            href={item.href!}
                                            className={`
                                                group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                                                ${isActive 
                                                    ? 'text-white bg-slate-800/80 shadow-sm ring-1 ring-slate-700/50' 
                                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon 
                                                    className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`} 
                                                    strokeWidth={1.75} 
                                                />
                                                <span>{item.name}</span>
                                            </div>
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    );
                })}
            </div>

            {/* Premium User Profile Footer */}
            <div className="p-4 border-t border-slate-800/60 bg-slate-950">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 ring-1 ring-slate-800/60 hover:ring-slate-700 transition-all duration-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <span className="text-sm font-bold text-amber-500">
                                {user.email.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-medium text-slate-200 truncate">
                                {user.email.split('@')[0]}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                                {user.role}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        title="Sign out"
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-200"
                    >
                        <LogOut className="w-4 h-4" strokeWidth={2} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
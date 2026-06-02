'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../_components/shared/side-navBar/Sidebar';
import PaymentGuard from '../../_components/PaymentGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/'); // Not logged in
            return;
        }

        const user = JSON.parse(userStr);

        console.log("user--",user)

        // Smart Routing: If user navigates to the base '/dashboard', push them to their specific role dashboard
        if (pathname === '/dashboard') {
            if (user.role === 'ADMIN') router.push('/dashboard/admin');
            else if (user.role === 'JUNIOR_LAWYER') router.push('/dashboard/junior_lawyer');
            else if (user.role === 'CLERK') router.push('/dashboard/clerk');
        } else {
            setIsLoading(false);
        }
    }, [router, pathname]);

    // if (isLoading) {

    // }
return (
        <PaymentGuard>
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                
                {/* ADDED PADDING HERE: p-4 sm:p-6 lg:p-8 */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
                
            </div>
        </PaymentGuard>
    );
}
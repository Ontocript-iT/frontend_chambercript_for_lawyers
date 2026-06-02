// app/settings/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { userService } from '../../../_services/user/userService';
import { UserDetails } from '../../../models/user';

export default function ProfileDetailsPage() {
    const [profile, setProfile] = useState<UserDetails | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (!storedUser) throw new Error("No user session found.");
                
                const user = JSON.parse(storedUser);
                const response = await userService.getUserDetails(user.id);
                setProfile(response.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (isLoading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-slate-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-200 rounded col-span-2"></div><div className="h-2 bg-slate-200 rounded col-span-1"></div></div></div></div></div>;
    
    if (error) return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
    if (!profile) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                    <label className="block text-sm font-medium text-slate-500">First Name</label>
                    <div className="mt-1 text-base text-slate-900 font-medium">{profile.firstName}</div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-500">Last Name</label>
                    <div className="mt-1 text-base text-slate-900 font-medium">{profile.lastName}</div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-500">Email Address</label>
                    <div className="mt-1 text-base text-slate-900 font-medium">{profile.email}</div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-500">National ID (NIC)</label>
                    <div className="mt-1 text-base text-slate-900 font-medium">{profile.nic || 'Not provided'}</div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-500">System Role</label>
                    <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {profile.role}
                        </span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-500">Account Status</label>
                    <div className="mt-1">
                        {profile.enabled ? (
                            <span className="text-green-600 font-medium text-sm flex items-center">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Active
                            </span>
                        ) : (
                            <span className="text-red-600 font-medium text-sm flex items-center">
                                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Disabled
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
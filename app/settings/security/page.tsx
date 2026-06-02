// app/settings/security/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { userService } from '../../../_services/user/userService';

export default function SecurityPage() {
    const [userId, setUserId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserId(JSON.parse(storedUser).id);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }

        if (!userId) {
            setStatus({ type: 'error', message: 'User session not found. Please log in again.' });
            return;
        }

        setIsSubmitting(true);
        try {
            await userService.changePassword(userId, formData.currentPassword, formData.newPassword);
            setStatus({ type: 'success', message: 'Password updated successfully.' });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Change Password</h2>
            
            {status.message && (
                <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                    <input 
                        type="password" 
                        name="currentPassword" 
                        required 
                        value={formData.currentPassword} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                    <input 
                        type="password" 
                        name="newPassword" 
                        required 
                        value={formData.newPassword} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        required 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" 
                    />
                </div>
                
                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors focus:ring-4 focus:ring-amber-500/30 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}
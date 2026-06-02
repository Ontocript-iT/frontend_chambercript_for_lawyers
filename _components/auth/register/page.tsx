// components/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { authService } from '../../../_services/auth/authService';
import { RegisterAdminRequest } from '../../../models/auth';

export default function RegisterForm() {
    const [formData, setFormData] = useState<RegisterAdminRequest>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        nic: '',
        planType: localStorage.getItem('selectedPlan') || '',
    });
    const [status, setStatus] = useState({ error: '', success: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ error: '', success: '' });
        try {
            await authService.registerAdmin(formData);
            setStatus({ error: '', success: 'Administrator registered successfully.' });
        } catch (err: any) {
            setStatus({ error: err.message, success: '' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12">
            <div className="max-w-lg w-full p-8 bg-white shadow-lg border-t-4 border-amber-600 rounded-sm">
                <h2 className="text-2xl font-serif text-center text-blue-900 mb-8">Register Administrator</h2>
                
                {status.error && <p className="text-red-500 text-sm mb-4 text-center">{status.error}</p>}
                {status.success && <p className="text-green-600 text-sm mb-4 text-center">{status.success}</p>}
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-900">First Name</label>
                            <input type="text" name="firstName" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-900">Last Name</label>
                            <input type="text" name="lastName" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-blue-900">Email Address</label>
                        <input type="email" name="email" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-900">Password</label>
                        <input type="password" name="password" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-900">Phone</label>
                            <input type="text" name="phone" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-900">NIC</label>
                            <input type="text" name="nic" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}
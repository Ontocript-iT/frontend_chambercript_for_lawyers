// app/dashboard/admin/users/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { adminService } from '../../../../../_services/admin/adminService';
import { RegisterEmployeeRequest, User } from '../../../../../models/auth';

export default function RegisterEmployeePage() {
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [status, setStatus] = useState({ error: '', success: '' });
    const [showUpgradeModal, setShowUpgradeModal] = useState(false); 
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'CLERK', // Default role
        nic: ''
    });

    // Fetch the logged-in admin's details on component mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setAdminUser(JSON.parse(storedUser));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ error: '', success: '' });

        if (!adminUser || adminUser.role !== 'ADMIN') {
            setStatus({ error: 'Unauthorized: Only administrators can register employees.', success: '' });
            return;
        }

        // Construct the final payload based on RegisterEmployeeRequest
        const payload: RegisterEmployeeRequest = {
            ...formData,
            adminId: adminUser.id // Automatically injected from the logged-in user
        };

        try {
            await adminService.registerEmployee(payload);
            setStatus({ error: '', success: `Employee ${formData.firstName} registered successfully as ${formData.role}.` });
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'CLERK', nic: '' });
        } catch (err: any) {
           if (err.message && err.message.includes('Employee limit exceeded')) {
                setShowUpgradeModal(true);
            } else {
                setStatus({ error: err.message, success: '' });
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 bg-white p-8 shadow-md border-t-4 border-blue-900 rounded-sm">
            <h1 className="text-2xl font-serif font-bold text-slate-900 mb-8">
                Register New Employee
            </h1>

            {status.error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-sm">{status.error}</div>}
            {status.success && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-sm">{status.success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-blue-900">First Name</label>
                        <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="mt-1 text-slate-500 block text-slate-500 w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-900">Last Name</label>
                        <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="mt-1 text-slate-500 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-blue-900">Email Address</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block text-slate-500 w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-900">Password</label>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} className="mt-1 block text-slate-500 w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-blue-900">System Role</label>
                        <select name="role" required value={formData.role} onChange={handleChange} className="mt-1 block w-full text-slate-500 px-3 py-2 border border-slate-300 bg-white rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600">
                            <option value="CLERK">Clerk</option>
                            <option value="JUNIOR_LAWYER">Junior Lawyer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-900">National Identity Card (NIC)</label>
                        <input type="text" name="nic" required value={formData.nic} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border text-slate-500 border-slate-500 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600"
                    >
                        Register Employee
                    </button>
                </div>
            </form>

{showUpgradeModal && (
                <div 
                    className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 sm:p-8">
                            {/* Alert Icon */}
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
                                <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            {/* Text Content */}
                            <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">
                                Plan Limit Exceeded
                            </h2>
                            <p className="text-slate-600 text-center mb-8 leading-relaxed">
                                You have reached the maximum number of employees allowed on your current plan. Upgrade your subscription to unlock more seats.
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button 
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="w-full sm:w-1/2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        window.location.href = '/dashboard/admin/subscription'; 
                                    }}
                                    className="w-full sm:w-1/2 px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all shadow-sm flex justify-center items-center gap-2"
                                >
                                    Upgrade Plan
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
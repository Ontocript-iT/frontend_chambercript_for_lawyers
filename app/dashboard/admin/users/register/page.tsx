// app/dashboard/admin/users/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { adminService } from '../../../../../_services/admin/adminService';
import { RegisterEmployeeRequest, User } from '../../../../../models/auth';

export default function RegisterEmployeePage() {
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [status, setStatus] = useState({ error: '', success: '' });
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
            // Optional: clear form
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'CLERK', nic: '' });
        } catch (err: any) {
            setStatus({ error: err.message, success: '' });
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
                        <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-900">Last Name</label>
                        <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-blue-900">Email Address</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-900">Password</label>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-blue-900">System Role</label>
                        <select name="role" required value={formData.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600">
                            <option value="CLERK">Clerk</option>
                            <option value="MANAGER">Manager</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-900">National Identity Card (NIC)</label>
                        <input type="text" name="nic" required value={formData.nic} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
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
        </div>
    );
}
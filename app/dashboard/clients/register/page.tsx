// app/dashboard/clients/register/page.tsx
'use client';

import { useState } from 'react';
import { clientService } from '../../../../_services/client/clientService';
import { ClientRegisterRequest } from '../../../../models/client';

export default function RegisterClientPage() {
    const [formData, setFormData] = useState<ClientRegisterRequest>({
        name: '',
        nic: '',
        password: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await clientService.registerClient(formData);
            setStatus({ type: 'success', message: 'Client registered successfully.' });
            // Reset form
            setFormData({ name: '', nic: '', password: '', phone: '', email: '', address: '', notes: '' });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Client Registration Form</h2>

            {status.message && (
                <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">NIC</label>
                        <input type="text" name="nic" required value={formData.nic} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Portal Password (Optional)</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" placeholder="Leave blank to auto-generate" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Residential Address</label>
                    <textarea name="address" required rows={2} value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
                    <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" placeholder="VIP client, special requests, etc."></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                        {isSubmitting ? 'Registering...' : 'Complete Registration'}
                    </button>
                </div>
            </form>
        </div>
    );
}
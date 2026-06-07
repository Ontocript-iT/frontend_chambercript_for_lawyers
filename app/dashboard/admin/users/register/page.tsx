'use client';

import { useState, useEffect } from 'react';
import { adminService } from '../../../../../_services/admin/adminService';
import { User } from '../../../../../models/auth';

export default function RegisterEmployeePage() {
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [status, setStatus] = useState({ error: '', success: '' });
    const [showUpgradeModal, setShowUpgradeModal] = useState(false); 
    const [formKey, setFormKey] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'CLERK', 
        nic: '',
        identifyType: 'NIC' // Default identity type
    });

    const [identityImage1, setIdentityImage1] = useState<File | null>(null);
    const [identityImage2, setIdentityImage2] = useState<File | null>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'image1' | 'image2') => {
        if (e.target.files && e.target.files[0]) {
            if (fieldName === 'image1') setIdentityImage1(e.target.files[0]);
            if (fieldName === 'image2') setIdentityImage2(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ error: '', success: '' });

    if (!adminUser || adminUser.role !== 'ADMIN') {
        setStatus({ error: 'Unauthorized: Only administrators can register employees.', success: '' });
        return;
    }

    if (formData.identifyType === 'NIC' && (!identityImage1 || !identityImage2)) {
        setStatus({ error: 'Both front and back images are required for NIC uploads.', success: '' });
        return;
    }
    if (formData.identifyType !== 'NIC' && !identityImage1) {
        setStatus({ error: `An identity image is required for ${formData.identifyType}.`, success: '' });
        return;
    }

    // Set loading state to true right before constructing payload and sending request
    setIsSubmitting(true);

    const multipartPayload = new FormData();
    multipartPayload.append('firstName', formData.firstName);
    multipartPayload.append('lastName', formData.lastName);
    multipartPayload.append('email', formData.email);
    multipartPayload.append('password', formData.password);
    multipartPayload.append('role', formData.role);
    multipartPayload.append('nic', formData.nic);
    multipartPayload.append('identifyType', formData.identifyType);
    multipartPayload.append('adminId', adminUser.id.toString());

    if (identityImage1) multipartPayload.append('identityImage1', identityImage1);
    if (identityImage2 && formData.identifyType === 'NIC') {
        multipartPayload.append('identityImage2', identityImage2);
    }

    try {
        await adminService.registerEmployee(multipartPayload);
        setStatus({ error: '', success: `Employee ${formData.firstName} registered successfully as ${formData.role}.` });
        
        setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'CLERK', nic: '', identifyType: 'NIC' });
        setIdentityImage1(null);
        setIdentityImage2(null);
        setFormKey(prev => prev + 1); 
    } catch (err: any) {
       if (err.message && err.message.includes('Employee limit exceeded')) {
            setShowUpgradeModal(true);
        } else {
            setStatus({ error: err.message, success: '' });
        }
    } finally {
        // Always set loading to false when request finishes, whether it succeeds or fails
        setIsSubmitting(false);
    }
};

    return (
        <div className="max-w-3xl mx-auto mt-8 bg-white p-8 shadow-md border-t-4 border-blue-900 rounded-sm">
            <h1 className="text-2xl font-serif font-bold text-slate-900 mb-8">
                Register New Staff Member
            </h1>

            {status.error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-sm">{status.error}</div>}
            {status.success && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-sm">{status.success}</div>}

            <form onSubmit={handleSubmit} key={formKey} className="space-y-6">
                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-blue-900">First Name</label>
                        <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="mt-1 text-slate-500 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-900">Last Name</label>
                        <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="mt-1 text-slate-500 block w-full px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                    </div>
                </div>

                {/* Email and Password Row */}
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

                {/* Roles & Identification Type Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-blue-900">System Role</label>
                        <select name="role" required value={formData.role} onChange={handleChange} className="mt-1 block w-full text-slate-500 px-3 py-2 border border-slate-300 bg-white rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600">
                            <option value="CLERK">Clerk</option>
                            <option value="JUNIOR_LAWYER">Junior Lawyer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-900">Identification Document Type</label>
                        <select name="identifyType" required value={formData.identifyType} onChange={handleChange} className="mt-1 block w-full text-slate-500 px-3 py-2 border border-slate-300 bg-white rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600">
                            <option value="NIC">NIC (National Identity Card)</option>
                            <option value="PASSPORT">Passport</option>
                            <option value="DRIVING_LICENCE">Driving Licence</option>
                        </select>
                    </div>
                </div>

                {/* Identification Number Entry */}
                <div>
                    <label className="block text-sm font-medium text-blue-900">
                        {formData.identifyType === 'NIC' ? 'NIC Number' : formData.identifyType === 'PASSPORT' ? 'Passport Number' : 'Driving Licence Number'}
                    </label>
                    <input type="text" name="nic" required value={formData.nic} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border text-slate-500 border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600" />
                </div>

                {/* Document Binary Upload Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <label className="block text-sm font-medium text-blue-900">
                            {formData.identifyType === 'NIC' ? 'Identity Image (Front Side)' : 'Upload Document Image'}
                        </label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            required
                            onChange={(e) => handleFileChange(e, 'image1')}
                            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100"
                        />
                    </div>

                    {formData.identifyType === 'NIC' && (
                        <div>
                            <label className="block text-sm font-medium text-blue-900">Identity Image (Back Side)</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                required
                                onChange={(e) => handleFileChange(e, 'image2')}
                                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100"
                            />
                        </div>
                    )}
                </div>

               <div className="pt-4 border-t border-slate-200">
    <button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto px-6 py-2 flex items-center justify-center border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-blue-900"
    >
        {isSubmitting ? (
            <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </>
        ) : (
            'Register Employee'
        )}
    </button>
</div>
            </form>

            {/* Subscription Modal Layout */}
            {showUpgradeModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
                                <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">Plan Limit Exceeded</h2>
                            <p className="text-slate-600 text-center mb-8 leading-relaxed">
                                You have reached the maximum number of employees allowed on your current plan. Upgrade your subscription to unlock more seats.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button onClick={() => setShowUpgradeModal(false)} className="w-full sm:w-1/2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all">
                                    Cancel
                                </button>
                                <button onClick={() => { window.location.href = '/dashboard/admin/subscription'; }} className="w-full sm:w-1/2 px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all shadow-sm flex justify-center items-center gap-2">
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
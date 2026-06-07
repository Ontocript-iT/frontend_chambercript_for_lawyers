'use client';

import { useState } from 'react';
import { authService } from '../../../../_services/auth/authService';
import { RegisterAdminRequest } from '../../../../models/auth';
import { User, Mail, Lock, Phone, CreditCard, AlertCircle, CheckCircle2, ArrowRight,MessageSquare } from 'lucide-react';

export default function RegisterForm() {
    // Determine the plan from local storage to show in the UI
    const selectedPlan = typeof window !== 'undefined' ? localStorage.getItem('selectedPlan') || 'STANDARD' : 'STANDARD';

    const [formData, setFormData] = useState<RegisterAdminRequest>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        nic: '',
        planType: selectedPlan,
        smsPlan: 'NONE',
    });
    
    const [status, setStatus] = useState({ error: '', success: '' });
    const [isLoading, setIsLoading] = useState(false);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ error: '', success: '' });
        setIsLoading(true);
        
        try {
            await authService.registerAdmin(formData);
            setStatus({ error: '', success: 'Registration successful! You can now log in.' });
        } catch (err: any) {
            setStatus({ error: err.message || 'Registration failed. Please try again.', success: '' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-6 text-center lg:text-left">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Create Account</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Set up your administrator profile to begin your 14-day free trial.
                </p>
                
                {/* Plan Indicator Badge */}
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    Selected Plan: {selectedPlan}
                </div>
            </div>

            {status.error && (
                <div className="p-3 rounded-lg text-sm flex items-start gap-2 mb-6 bg-red-50 text-red-700 border border-red-100 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{status.error}</span>
                </div>
            )}
            
            {status.success && (
                <div className="p-3 rounded-lg text-sm flex items-start gap-2 mb-6 bg-emerald-50 text-emerald-700 border border-emerald-100 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{status.success}</span>
                </div>
            )}
            
            <form onSubmit={handleRegister} className="space-y-4">
                
                {/* Name Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                name="firstName" 
                                required 
                                onChange={handleChange} 
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                                placeholder="John"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                name="lastName" 
                                required 
                                onChange={handleChange} 
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                                placeholder="Doe"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Email */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            onChange={handleChange} 
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                            placeholder="admin@lawfirm.com"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Create Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                            type="password" 
                            name="password" 
                            required 
                            minLength={6}
                            onChange={handleChange} 
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {/* Phone & NIC Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                name="phone" 
                                required 
                                onChange={handleChange} 
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                                placeholder="+94 77..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">National ID (NIC)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                name="nic" 
                                required 
                                onChange={handleChange} 
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm"
                                placeholder="ID Number"
                            />
                        </div>
                    </div>
                </div>

                {/* SMS Plan Selection */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">SMS Plan</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MessageSquare className="h-4 w-4 text-slate-400" />
                        </div>
                        <select 
                            name="smsPlan" 
                            required 
                            value={formData.smsPlan}
                            onChange={handleChange} 
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50/50 focus:bg-white text-sm appearance-none"
                        >
                            <option value="NONE">None</option>
                            <option value="BASIC">Basic</option>
                            <option value="PRO">Pro</option>
                            <option value="UNLIMITED">Unlimited</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !!status.success}
                    className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-md shadow-amber-500/20 disabled:opacity-70 disabled:shadow-none flex justify-center items-center group"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            Complete Registration
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
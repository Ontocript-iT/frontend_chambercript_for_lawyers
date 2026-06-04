'use client';

import { useState } from 'react';
import { PaymentRecord } from '../../../../models/superAdmin';
import { Building, Calendar, DollarSign, X, CheckCircle2, Search, AlertCircle } from 'lucide-react';
import { superAdminService } from '@/_services/super-admin/super-admin.service';

export default function PaymentsPage() {
    const [firmCodeInput, setFirmCodeInput] = useState('');
    const [activeFirmCode, setActiveFirmCode] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
    const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({ month: 0, amount: 49.99, reference: '' });
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const fetchPaymentHistory = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!firmCodeInput) return;
        
        setActiveFirmCode(firmCodeInput);
        setIsPaymentsLoading(true); 
        setError('');

        try {
            const data = await superAdminService.getPaymentHistory(firmCodeInput);
            setPaymentHistory(data);
        } catch (err: any) { 
            setError("Could not fetch history. Please verify the Firm Code is correct."); 
            setPaymentHistory([]);
        } finally { 
            setIsPaymentsLoading(false); 
        }
    };

    const getMonthPayment = (monthIndex: number) => paymentHistory.find(p => p.paymentYear === selectedYear && p.paymentMonth === (monthIndex + 1));

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingPayment(true);
        try {
            const newRecord = await superAdminService.recordPayment(activeFirmCode, {
                paymentYear: selectedYear,
                paymentMonth: paymentForm.month,
                amountPaid: paymentForm.amount,
                transactionReference: paymentForm.reference
            });
            setPaymentHistory(prev => [...prev.filter(p => !(p.paymentMonth === paymentForm.month && p.paymentYear === selectedYear)), newRecord.data]);
            setIsPaymentModalOpen(false);
        } catch (err: any) { 
            alert(err.message); 
        } finally { 
            setIsSubmittingPayment(false); 
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">
                    Payment Tracker
                </h1>
                <p className="text-slate-500 mt-2">
                    Monitor and record monthly subscription payments for your registered law firms.
                </p>
            </div>

            {/* Search & Filter Control Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
                <form onSubmit={fetchPaymentHistory} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Law Firm Code</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Building className="w-5 h-5 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                required
                                value={firmCodeInput} 
                                onChange={(e) => setFirmCodeInput(e.target.value.toUpperCase())} 
                                placeholder="e.g., LF000001" 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-mono text-sm transition-all" 
                            />
                        </div>
                    </div>
                    
                    <div className="w-full md:w-56">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Billing Year</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Calendar className="w-5 h-5 text-slate-400" />
                            </div>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(Number(e.target.value))} 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm transition-all appearance-none cursor-pointer"
                            >
                                <option value={selectedYear - 1}>{selectedYear - 1}</option>
                                <option value={selectedYear}>{selectedYear}</option>
                                <option value={selectedYear + 1}>{selectedYear + 1}</option>
                            </select>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={!firmCodeInput || isPaymentsLoading} 
                        className="w-full md:w-auto px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isPaymentsLoading ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Loading...</>
                        ) : (
                            <><Search className="w-4 h-4" /> Load Ledger</>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            {/* Payment Grid */}
            {activeFirmCode && !isPaymentsLoading && !error && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                    <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-amber-500" /> 
                            Subscription Ledger
                        </h3>
                        <span className="text-sm font-mono font-medium text-slate-500 bg-white px-3 py-1 rounded-md border border-slate-200">
                            {activeFirmCode} &bull; {selectedYear}
                        </span>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {monthNames.map((month, index) => {
                                const record = getMonthPayment(index);
                                const isPaid = record?.isPaid;

                                return (
                                    <div key={month} className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${isPaid ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}>
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">{month}</span>
                                        {isPaid ? (
                                            <div className="flex flex-col items-center">
                                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                                                <span className="text-base font-bold text-slate-900">${record.amountPaid}</span>
                                                <span className="text-[10px] font-medium text-emerald-700 mt-1 truncate w-full px-2" title={record.transactionReference}>
                                                    Ref: {record.transactionReference}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center w-full mt-1">
                                                <span className="text-xs font-bold tracking-wider text-red-600 bg-red-100 px-2.5 py-1 rounded-md mb-3">
                                                    UNPAID
                                                </span>
                                                <button 
                                                    onClick={() => { 
                                                        setPaymentForm({ month: index + 1, amount: 49.99, reference: '' }); 
                                                        setIsPaymentModalOpen(true); 
                                                    }} 
                                                    className="w-full py-2 bg-white border border-slate-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shadow-sm"
                                                >
                                                    Record Payment
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Record Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700"><DollarSign className="w-5 h-5" /></div>
                                Record Monthly Payment
                            </h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Firm Code</p>
                                    <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">{activeFirmCode}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Period</p>
                                    <p className="text-lg font-bold text-slate-900 mt-0.5">{monthNames[paymentForm.month - 1]} {selectedYear}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount Paid ($)</label>
                                <input 
                                    required 
                                    type="number" 
                                    step="0.01" 
                                    value={paymentForm.amount} 
                                    onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transaction Reference ID</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={paymentForm.reference} 
                                    onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-mono transition-all" 
                                    placeholder="e.g., TXN-987654321" 
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-5 py-2.5 text-sm text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bold transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmittingPayment} className="px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors disabled:opacity-70 flex items-center gap-2 shadow-md shadow-blue-600/20">
                                    {isSubmittingPayment ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</> : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
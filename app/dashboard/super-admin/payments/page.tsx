// app/dashboard/super-admin/payments/page.tsx
'use client';

import { useState } from 'react';
import { PaymentRecord } from '../../../../models/superAdmin';
import { Building, Calendar, DollarSign, X, CheckCircle2 } from 'lucide-react';
import { superAdminService } from '@/_services/super-admin/super-admin.service';

export default function PaymentsPage() {
    const [firmCodeInput, setFirmCodeInput] = useState('');
    const [activeFirmCode, setActiveFirmCode] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
    const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
    
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({ month: 0, amount: 49.99, reference: '' });
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const fetchPaymentHistory = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!firmCodeInput) return;
        setActiveFirmCode(firmCodeInput);
        setIsPaymentsLoading(true); 
        try {
            const data = await superAdminService.getPaymentHistory(firmCodeInput);
            setPaymentHistory(data);
        } catch (err: any) { alert("Could not fetch history. Check if Firm Code is valid."); } 
        finally { setIsPaymentsLoading(false); }
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
        } catch (err: any) { alert(err.message); } 
        finally { setIsSubmittingPayment(false); }
    };

    return (
        <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-4 items-end mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Law Firm Code</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={firmCodeInput} onChange={(e) => setFirmCodeInput(e.target.value.toUpperCase())} placeholder="e.g., LF000001" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono" />
                    </div>
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Billing Year</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                        <option value={selectedYear - 1}>{selectedYear - 1}</option>
                        <option value={selectedYear}>{selectedYear}</option>
                        <option value={selectedYear + 1}>{selectedYear + 1}</option>
                    </select>
                </div>
                <button onClick={fetchPaymentHistory} disabled={!firmCodeInput || isPaymentsLoading} className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 font-medium transition-colors disabled:opacity-50">
                    {isPaymentsLoading ? 'Loading...' : 'Load Grid'}
                </button>
            </div>

            {activeFirmCode && !isPaymentsLoading && (
                <div className="animate-in fade-in duration-300">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" /> Subscription Grid for {activeFirmCode} ({selectedYear})
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {monthNames.map((month, index) => {
                            const record = getMonthPayment(index);
                            const isPaid = record?.isPaid;

                            return (
                                <div key={month} className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${isPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'}`}>
                                    <span className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">{month}</span>
                                    {isPaid ? (
                                        <div className="flex flex-col items-center">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                                            <span className="text-sm font-bold text-slate-900">${record.amountPaid}</span>
                                            <span className="text-[10px] font-medium text-emerald-700 mt-1 truncate w-full" title={record.transactionReference}>Ref: {record.transactionReference}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center w-full mt-1">
                                            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 mb-3">UNPAID</span>
                                            <button onClick={() => { setPaymentForm({ month: index + 1, amount: 49.99, reference: '' }); setIsPaymentModalOpen(true); }} className="w-full py-2 bg-slate-100 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">Record Payment</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600"><DollarSign className="w-5 h-5" /></div>
                                Record Monthly Payment
                            </h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Firm Code</p>
                                    <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">{activeFirmCode}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Period</p>
                                    <p className="text-lg font-bold text-slate-900 mt-0.5">{monthNames[paymentForm.month - 1]} {selectedYear}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount Paid ($)</label>
                                <input required type="number" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transaction Reference ID</label>
                                <input required type="text" value={paymentForm.reference} onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono" placeholder="e.g., TXN-987654321" />
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-medium transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmittingPayment} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                                    {isSubmittingPayment ? 'Processing...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
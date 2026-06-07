'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '../../../../../_services/admin/adminService';
import { Employee } from '../../../../../models/employee';
import { User } from '../../../../../models/auth';
import { Trash2, Ban, Mail, Phone, Search, ShieldAlert, Eye, X, FileText } from 'lucide-react';

export default function UserDirectoryPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [activeVerificationEmp, setActiveVerificationEmp] = useState<any>(null);

    useEffect(() => {
        const fetchStaff = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                router.push('/');
                return;
            }

            const user: User = JSON.parse(storedUser);

            if (user.role !== 'ADMIN') {
                setError('Unauthorized: Only administrators can view the user directory.');
                setIsLoading(false);
                return;
            }

            try {
                const data = await adminService.getEmployeesByAdmin(user.id);
                setEmployees(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStaff();
    }, [router]);

    const handleDeactivate = (employeeId: number, name: string) => {
        if (confirm(`Are you sure you want to deactivate ${name}? They will lose access to the system.`)) {
            console.log('Deactivate triggered for ID:', employeeId);
        }
    };

    const handleDelete = async (employeeId: number, name: string) => {
        if (confirm(`CRITICAL ACTION: Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) {
            try {
                await adminService.deleteEmployee(employeeId);
                setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== employeeId));
                alert(`Success: ${name} has been removed from the system.`);
            } catch (err: any) {
                console.error("Delete failed:", err);
                alert(`Error: Could not delete ${name}. ${err.message}`);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">No employees found for admin</h3>
                <p className="text-slate-500 mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-slate-900">Staff Directory</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage firm staff, clerks, and junior lawyers.</p>
                </div>
                
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search employees..." 
                        className="w-full pl-9 pr-4 py-2 text-sm border text-slate-500 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>
            </div>

            {/* Premium Table Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="py-4 px-6">Employee</th>
                                <th className="py-4 px-6">Contact Info</th>
                                <th className="py-4 px-6">System Role</th>
                                <th className="py-4 px-6">Identification</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-500">
                                        No employees found. Start by registering a new employee.
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                                        
                                        {/* Profile / Name Column */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                {emp.profilePictureUrl ? (
                                                    <img 
                                                        src={emp.profilePictureUrl} 
                                                        alt={emp.name} 
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                                                        {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-slate-900">{emp.name}</div>
                                                    <div className="text-xs text-slate-500">Emp ID: #{emp.userId}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact Column */}
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="break-all">{emp.email}</span>
                                                </div>
                                                {emp.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        {emp.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Role Badge Column */}
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${emp.role === 'MANAGER' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                  emp.role === 'CLERK' ? 'bg-slate-100 text-slate-700 border-slate-200' : 
                                                  'bg-amber-50 text-amber-700 border-amber-200'}`}
                                            >
                                                {emp.role}
                                            </span>
                                        </td>

                                        {/* New Identification Column */}
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-medium text-slate-900">
                                                {emp.identifyType || 'N/A'}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                                                {emp.identificationNumber || 'No ID Number'}
                                            </div>
                                        </td>

                                        {/* Actions Column */}
                                        <td className="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                                            {/* Action Button to Open Verification Modal */}
                                            <button 
                                                onClick={() => setActiveVerificationEmp(emp)}
                                                title="View Verification Documents"
                                                className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            <button 
                                                onClick={() => handleDeactivate(emp.id, emp.name)}
                                                title="Deactivate Account"
                                                className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>

                                            <button 
                                                onClick={() => handleDelete(emp.id, emp.name)}
                                                title="Delete Account"
                                                className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Documents Modal Popup Container */}
            {activeVerificationEmp && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                        
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-900">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{activeVerificationEmp.name}'s Credentials</h2>
                                    <p className="text-xs text-slate-500">
                                        Type: <span className="font-semibold">{activeVerificationEmp.identifyType}</span> | No: <span className="font-mono font-semibold">{activeVerificationEmp.identificationNumber}</span>
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveVerificationEmp(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body / Image Content View Area */}
                        <div className="p-6 overflow-y-auto space-y-6 bg-slate-100/50 flex-1">
                            {(!activeVerificationEmp.image1 && !activeVerificationEmp.image2) ? (
                                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                                    <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">No identity document image links were recorded for this employee profile.</p>
                                </div>
                            ) : (
                                <div className={`grid gap-6 ${activeVerificationEmp.identifyType === 'NIC' && activeVerificationEmp.image2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                    
                                    {/* Verification Document Image 1 */}
                                    {activeVerificationEmp.image1 ? (
                                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                                {activeVerificationEmp.identifyType === 'NIC' ? 'Front Side Preview' : 'Document Scan'}
                                            </span>
                                            <div className="relative w-full h-64 md:h-80 bg-slate-50 rounded border flex items-center justify-center overflow-hidden">
                                                <img 
                                                    src={activeVerificationEmp.image1} 
                                                    alt="Identity Document Front Side" 
                                                    className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-200"
                                                />
                                            </div>
                                            <a 
                                                href={activeVerificationEmp.image1} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="mt-3 text-xs text-blue-700 hover:underline inline-flex items-center gap-1 font-medium"
                                            >
                                                Open raw link in new tab ↗
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="bg-white p-6 text-center rounded-lg border border-slate-200 text-slate-400 text-sm">
                                            Primary scan image missing
                                        </div>
                                    )}

                                    {/* Verification Document Image 2 (Renders primarily for NIC Secondary views) */}
                                    {activeVerificationEmp.identifyType === 'NIC' && (
                                        activeVerificationEmp.image2 ? (
                                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Back Side Preview</span>
                                                <div className="relative w-full h-64 md:h-80 bg-slate-50 rounded border flex items-center justify-center overflow-hidden">
                                                    <img 
                                                        src={activeVerificationEmp.image2} 
                                                        alt="Identity Document Back Side" 
                                                        className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-200"
                                                    />
                                                </div>
                                                <a 
                                                    href={activeVerificationEmp.image2} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="mt-3 text-xs text-blue-700 hover:underline inline-flex items-center gap-1 font-medium"
                                                >
                                                    Open raw link in new tab ↗
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="bg-white p-6 text-center rounded-lg border border-slate-200 text-slate-400 text-sm flex items-center justify-center">
                                                Back side view missing for NIC profile
                                            </div>
                                        )
                                    )}

                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
                            <button 
                                onClick={() => setActiveVerificationEmp(null)}
                                className="px-4 py-2 bg-slate-800 text-white rounded-sm text-sm font-medium hover:bg-slate-700 transition-colors"
                            >
                                Close Viewer
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
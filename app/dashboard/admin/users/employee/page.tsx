// app/dashboard/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '../../../../../_services/admin/adminService';
import { Employee } from '../../../../../models/employee';
import { User } from '../../../../../models/auth';
import { Trash2, Ban, Mail, Phone, Search, ShieldAlert } from 'lucide-react';
import Image from 'next/image';

export default function UserDirectoryPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                router.push('/');
                return;
            }

            const user: User = JSON.parse(storedUser);

            // Strict Role Protection
            if (user.role !== 'ADMIN') {
                setError('Unauthorized: Only administrators can view the user directory.');
                setIsLoading(false);
                return;
            }

            try {
                // Pass the admin's ID to fetch their specific employees
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

    // Placeholder actions for the buttons
    const handleDeactivate = (employeeId: number, name: string) => {
        if (confirm(`Are you sure you want to deactivate ${name}? They will lose access to the system.`)) {
            console.log('Deactivate triggered for ID:', employeeId);
            // TODO: Call your backend deactivate endpoint here
        }
    };

 const handleDelete = async (employeeId: number, name: string) => {
        if (confirm(`CRITICAL ACTION: Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) {
            try {
                // 1. Call the backend to delete the record
                await adminService.deleteEmployee(employeeId);
                
                // 2. Update the UI state to remove the employee instantly
                setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== employeeId));
                
                // 3. Show a success confirmation
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
                <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
                <p className="text-slate-500 mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-slate-900">User Directory</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage firm employees, clerks, and managers.</p>
                </div>
                
                {/* Search Bar (Visual Only for now) */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search employees..." 
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-500">
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
                                                        {emp.name.charAt(0).toUpperCase()}
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
                                                    {emp.email}
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

                                        {/* Actions Column */}
                                        <td className="py-4 px-6 text-right space-x-2">
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
        </div>
    );
}
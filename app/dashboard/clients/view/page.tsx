// app/dashboard/clients/view/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { clientService } from '../../../../_services/client/clientService';
import { taskService } from '../../../../_services/task/taskService';
import { userService } from '../../../../_services/user/userService'; // <-- Import your user service
import { Client } from '../../../../models/client';
import { User } from '../../../../models/user';
import { CaseDetails } from '../../../../models/case';
import { useRouter } from 'next/navigation';
import { Search, Edit, Trash2, Mail, Phone, MapPin, Calendar, ShieldAlert, Briefcase, X, AlertCircle, FolderOpen, Gavel, ClipboardList, CheckCircle2 } from 'lucide-react';
import { adminService } from '@/_services/admin/adminService';

// New Interface for Employees
interface Employee {
    id: number;
    name: string;
    role: string;
}

export default function ViewClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [adminId, setAdminId] = useState<number>(0); // Store logged-in Admin/Manager ID

    // --- Case Modal State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<CaseDetails | null>(null);
    const [activeClientId, setActiveClientId] = useState<number | null>(null);
    const [isCaseLoading, setIsCaseLoading] = useState(false);
    const [caseError, setCaseError] = useState('');

    // --- Assign Task Modal State ---
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const [taskMsg, setTaskMsg] = useState({ type: '', text: '' });
    const [taskForm, setTaskForm] = useState({
        title: '', description: '', dueDate: '', assignedToId: '', caseId: ''
    });

    const [userRole, setUserRole] = useState<string>('');

   useEffect(() => {
        const fetchClients = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (!storedUser) throw new Error("Authentication error: No active session.");

                const user: User = JSON.parse(storedUser);
                if (!user.lawFirmCode) throw new Error("System error: No Law Firm Code associated with your account.");
                
                setAdminId(user.id);
                setUserRole(user.role); // <--- ADD THIS LINE to save the role

                const data = await clientService.getClientsByLawFirm(user.lawFirmCode);
                const sortedClients = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setClients(sortedClients);
            }catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClients();
    }, []);

    // --- Handlers ---
    const handleQuickViewFolders = async (clientId: number) => {
        try {
            const caseData = await clientService.getCaseByClientId(clientId);
            if (caseData && caseData.id) {
                localStorage.setItem('activeCaseId', caseData.id.toString());
            } else {
                localStorage.removeItem('activeCaseId');
            }
        } catch (err) {
            localStorage.removeItem('activeCaseId');
        }
        router.push(`/dashboard/clients/${clientId}/folders`);
    };

    const handleNavigateToFolders = (clientId: number, caseId: number) => {
        localStorage.setItem('activeCaseId', caseId.toString());
        router.push(`/dashboard/clients/${clientId}/folders`);
    };

    const handleViewCase = async (clientId: number, clientName: string) => {
        setIsModalOpen(true);
        setIsCaseLoading(true);
        setCaseError('');
        setSelectedCase(null);
        setActiveClientId(clientId);

        try {
            const caseData = await clientService.getCaseByClientId(clientId);
            if (!caseData) {
                setCaseError(`No active cases found for ${clientName}.`);
            } else {
                setSelectedCase(caseData);
            }
        } catch (err: any) {
            setCaseError(err.message || "Failed to load case details.");
        } finally {
            setIsCaseLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCase(null);
        setActiveClientId(null);
    };

    // --- Task Delegation Handlers ---
    const openAssignTaskModal = async (clientId: number) => {
        setIsTaskModalOpen(true);
        setTaskMsg({ type: '', text: '' });
        
        try {
            // 1. Fetch case ID quietly to link the task automatically
            const caseData = await clientService.getCaseByClientId(clientId);
            const activeCaseId = caseData?.id || '';
            setTaskForm(prev => ({ ...prev, caseId: activeCaseId.toString() }));

            // 2. Fetch employees for dropdown using the adminId
            if (adminId) {
                const empData = await adminService.getEmployeesByAdminId(adminId);
                setEmployees(empData);
            }
        } catch (err) {
            console.error("Failed to load prerequisite data for task assignment.");
        }
    };

    const handleAssignTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingTask(true); setTaskMsg({ type: '', text: '' });

        if (!taskForm.caseId) {
            setTaskMsg({ type: 'error', text: 'No active case found for this client to attach the task to.' });
            setIsSubmittingTask(false);
            return;
        }

        try {
            await taskService.assignTask({
                title: taskForm.title,
                description: taskForm.description,
                dueDate: taskForm.dueDate,
                assignedToId: Number(taskForm.assignedToId),
                caseId: Number(taskForm.caseId),
                assignedById: adminId
            });
            setTaskMsg({ type: 'success', text: 'Task assigned successfully!' });
            setTimeout(() => {
                setIsTaskModalOpen(false);
                setTaskForm({ title: '', description: '', dueDate: '', assignedToId: '', caseId: '' });
            }, 2000);
        } catch (err: any) {
            setTaskMsg({ type: 'error', text: err.message });
        } finally {
            setIsSubmittingTask(false);
        }
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return 'N/A';
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoString));
    };

    if (isLoading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div></div>;
    if (error) return <div className="flex flex-col items-center justify-center py-16 text-center"><ShieldAlert className="w-12 h-12 text-red-500 mb-4" /><h3 className="text-xl font-bold">Cannot Load Clients</h3><p>{error}</p></div>;

    return (
        <div>
            {/* Search Bar Area */}
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 rounded-t-xl">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search by name, NIC, or email..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">Total Clients: {clients.length}</span>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="py-4 px-6">Client Identity</th>
                            <th className="py-4 px-6">Contact Info</th>
                            <th className="py-4 px-6">Registration</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clients.length === 0 ? (
                            <tr><td colSpan={4} className="py-12 text-center text-slate-500">No clients found.</td></tr>
                        ) : (
                            clients.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-slate-900">{client.name}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">NIC: {client.nic}</div>
                                    </td>
                                    <td className="py-4 px-6 space-y-1.5">
                                        <div className="flex items-center text-sm text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" /> <span className="truncate max-w-[180px]">{client.email}</span></div>
                                        <div className="flex items-center text-sm text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" /> {client.phone}</div>
                                    </td>
                                    <td className="py-4 px-6 space-y-1.5">
                                        <div className="flex items-center text-sm text-slate-600"><Calendar className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" /> {formatDate(client.createdAt)}</div>
                                        <div className="flex items-start text-sm text-slate-500"><MapPin className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" /> <span className="truncate max-w-[180px] text-xs">{client.address}</span></div>
                                    </td>
                                  <td className="py-4 px-6 text-right space-x-2 flex justify-end">
        
        {/* 1. Delegate Task Button (ONLY SHOW FOR ADMIN) */}
        {userRole === 'ADMIN' && (
            <button 
                onClick={() => openAssignTaskModal(client.id)} 
                title="Delegate Task" 
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
                <ClipboardList className="w-4 h-4" />
            </button>
        )}
        
        {/* 2. Folders Button */}
        <button onClick={() => handleQuickViewFolders(client.id)} title="View Folders" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
            <FolderOpen className="w-4 h-4" />
        </button>
        
        {/* 3. Case Brief Button */}
        <button onClick={() => handleViewCase(client.id, client.name)} title="View Case Brief" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
            <Briefcase className="w-4 h-4" />
        </button>
    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Assign Task Modal Popup --- */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-600" /> Delegate Task</h3>
                            <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <form onSubmit={handleAssignTaskSubmit} className="p-6 space-y-4">
                            {taskMsg.text && (
                                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${taskMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                    {taskMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                                    {taskMsg.text}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Task Title</label>
                                <input required type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Draft legal brief" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Assign To</label>
                                    <select required value={taskForm.assignedToId} onChange={e => setTaskForm({...taskForm, assignedToId: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="" disabled>Select Employee...</option>
                                        {employees.map((emp: any) => (
                                            <option key={emp.userId} value={emp.userId}>{emp.name} ({emp.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Due Date</label>
                                    <input required type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Task Description</label>
                                <textarea required rows={3} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Instructions..." />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-5 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isSubmittingTask} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                                    {isSubmittingTask ? 'Assigning...' : 'Assign Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Case Details Modal Popup (Remains Unchanged) --- */}
            {isModalOpen && (
                // ... exactly the same case modal code as before ...
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2"><Briefcase className="w-5 h-5 text-amber-600" /> Case Overview</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 min-h-[300px]">
                            {isCaseLoading ? (
                                <div className="flex flex-col items-center justify-center h-full py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-4"></div></div>
                            ) : caseError ? (
                                <div className="flex flex-col items-center justify-center h-full py-12 text-center"><AlertCircle className="w-10 h-10 text-amber-500 mb-3" /><p className="font-medium">{caseError}</p></div>
                            ) : selectedCase ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">{selectedCase.caseTitle}</h4>
                                            <p className="text-sm font-mono text-slate-500 mt-1">Case No: {selectedCase.caseNumber}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full">{selectedCase.status.replace('_', ' ')}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <div><label className="text-xs font-semibold text-slate-500 uppercase">Case Type</label><p className="text-sm font-medium mt-0.5">{selectedCase.caseType?.typeName || 'N/A'}</p></div>
                                        <div><label className="text-xs font-semibold text-slate-500 uppercase">Filing Date</label><p className="text-sm font-medium mt-0.5">{selectedCase.filingDate}</p></div>
                                        <div><label className="text-xs font-semibold text-slate-500 uppercase">Assigned Court</label><p className="text-sm font-medium mt-0.5">{selectedCase.court?.courtName || 'N/A'}</p></div>
                                        <div><label className="text-xs font-semibold text-slate-500 uppercase">Assigned Lawyer</label><p className="text-sm font-medium mt-0.5">{selectedCase.assignedLawyer}</p></div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Description / Overview</label>
                                        <p className="text-sm text-slate-700 mt-1.5 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">{selectedCase.description}</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            {selectedCase?.id && activeClientId && (
                                <button 
                                    onClick={() => handleNavigateToFolders(activeClientId, selectedCase.id)}
                                    className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                >
                                    <FolderOpen className="w-4 h-4" /> Open Case Folders
                                </button>
                            )}

                            {selectedCase?.id && (
                                <button 
                                    onClick={() => router.push(`/dashboard/cases/${selectedCase.id}/hearings`)}
                                    className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Gavel className="w-4 h-4" /> Manage Hearings
                                </button>
                            )}
                            <button onClick={closeModal} className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
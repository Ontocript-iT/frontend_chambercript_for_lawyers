// app/dashboard/tasks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { taskService } from '../../../_services/task/taskService';
import { caseWorkspaceService } from '../../../_services/case/caseWorkspaceService';
import { Task } from '../../../models/task';
import { CaseDetails } from '../../../models/case';
import { CheckSquare, ListTodo, UserPlus, Briefcase, Calendar, X, AlertCircle, FolderOpen, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function TaskManagementPage() {
    const router = useRouter();
    
    // --- Session State ---
    const [userId, setUserId] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'my-tasks' | 'delegated' | 'assign'>('my-tasks');

    // --- Data State ---
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Assign Form State ---
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignForm, setAssignForm] = useState({
        title: '', description: '', dueDate: '', assignedToId: '', caseId: ''
    });
    const [formMsg, setFormMsg] = useState({ type: '', text: '' });

    // --- Case Modal State ---
    const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<any | null>(null);
    const [isCaseLoading, setIsCaseLoading] = useState(false);
    const [caseError, setCaseError] = useState('');

    const [userRole, setUserRole] = useState<string>('');

    // 1. Initial Load & Tab Switching
  useEffect(() => {
        const userStr = localStorage.getItem('user');
        let currentUserId = 0;
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setUserId(parsedUser.id);
            setUserRole(parsedUser.role); // <--- ADD THIS to save the role
            currentUserId = parsedUser.id;
        }

        if (activeTab === 'my-tasks') fetchMyTasks(currentUserId);
        if (activeTab === 'delegated') fetchDelegatedTasks(currentUserId);
    }, [activeTab]);

    const fetchMyTasks = async (uId: number) => {
        try {
            setIsLoading(true); setError('');
            const data = await taskService.getTasksByEmployee(uId || userId);
            setTasks(data);
        } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
    };

    const fetchDelegatedTasks = async (uId: number) => {
        try {
            setIsLoading(true); setError('');
            const data = await taskService.getTasksByAdmin(uId || userId);
            setTasks(data);
        } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
    };

    // 2. Assign Task Handler
    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAssigning(true); setFormMsg({ type: '', text: '' });

        try {
            await taskService.assignTask({
                title: assignForm.title,
                description: assignForm.description,
                dueDate: assignForm.dueDate,
                assignedToId: Number(assignForm.assignedToId),
                caseId: Number(assignForm.caseId),
                assignedById: userId
            });
            setFormMsg({ type: 'success', text: 'Task assigned successfully!' });
            setAssignForm({ title: '', description: '', dueDate: '', assignedToId: '', caseId: '' });
        } catch (err: any) {
            setFormMsg({ type: 'error', text: err.message });
        } finally {
            setIsAssigning(false);
        }
    };

    // 3. Update Status Handler
    const handleStatusChange = async (taskId: number, newStatus: string) => {
        try {
            // Optimistic UI update
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            await taskService.updateTaskStatus(taskId, userId, newStatus);
        } catch (err: any) {
            alert("Failed to update status: " + err.message);
            fetchMyTasks(userId); // Revert on failure
        }
    };

    // 4. Case View Handlers
    const openCaseView = async (caseId: number) => {
        setIsCaseModalOpen(true);
        setIsCaseLoading(true);
        setCaseError('');
        try {
            const data = await caseWorkspaceService.getCaseById(caseId);
            setSelectedCase(data);
        } catch (err: any) {
            setCaseError(err.message);
        } finally {
            setIsCaseLoading(false);
        }
    };

    const handleNavigateToFolders = (clientId: number, caseId: number) => {
        localStorage.setItem('activeCaseId', caseId.toString());
        router.push(`/dashboard/clients/${clientId}/folders`);
    };

    // Helper UI renderers
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600"><Clock className="w-3.5 h-3.5"/> Pending</span>;
            case 'IN_PROGRESS': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><PlayCircle className="w-3.5 h-3.5"/> In Progress</span>;
            case 'COMPLETED': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5"/> Completed</span>;
            default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 relative p-4 sm:p-6">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <CheckSquare className="w-8 h-8 text-blue-600" /> Task Center
                </h1>
                <p className="text-slate-500 mt-1.5">Manage case preparation, deadlines, and team assignments.</p>
            </div>

            {/* Navigation Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-xl inline-flex w-full sm:w-auto overflow-x-auto shadow-inner">
                <button 
                    onClick={() => setActiveTab('my-tasks')} 
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeTab === 'my-tasks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <ListTodo className="w-4 h-4" /> My Tasks
                </button>
                
                {/* ONLY SHOW DELEGATED TAB FOR ADMINS */}
                {userRole === 'ADMIN' && (
                    <button 
                        onClick={() => setActiveTab('delegated')} 
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeTab === 'delegated' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <Briefcase className="w-4 h-4" /> Delegated By Me
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                
                {/* --- Task Lists (My Tasks & Delegated) --- */}
                {(activeTab === 'my-tasks' || activeTab === 'delegated') && (
                    <div className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center px-4"><AlertCircle className="w-12 h-12 text-red-500 mb-4" /><p className="text-slate-800 font-medium">{error}</p></div>
                        ) : tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center text-slate-500 px-4">
                                <CheckSquare className="w-12 h-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-800">No tasks found</h3>
                                <p className="text-sm mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {tasks.map((task) => (
                                    <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group">
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-bold text-slate-900 truncate">{task.title}</h4>
                                                {getStatusBadge(task.status)}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{task.description}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400"/> Due: <span className={new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600 font-bold' : ''}>{task.dueDate}</span></span>
                                                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400"/> Case ID: {task.caseId}</span>
                                                {activeTab === 'my-tasks' 
                                                    ? <span className="flex items-center gap-1.5"><UserPlus className="w-4 h-4 text-slate-400"/> By: {task.assignedByName}</span>
                                                    : <span className="flex items-center gap-1.5"><UserPlus className="w-4 h-4 text-slate-400"/> To: {task.assignedToName}</span>
                                                }
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                            {/* Status Updater (Only for My Tasks) */}
                                            {activeTab === 'my-tasks' && (
                                                <select 
                                                    value={task.status} 
                                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                    className="w-full sm:w-auto bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="COMPLETED">Completed</option>
                                                </select>
                                            )}

                                            {/* Open Case Action */}
                                            <button 
                                                onClick={() => openCaseView(task.caseId)}
                                                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FolderOpen className="w-4 h-4" /> View Case
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- ASSIGN TASK TAB --- */}
                {activeTab === 'assign' && (
                    <div className="p-6 sm:p-10 max-w-2xl">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Delegate New Tasks</h2>
                        
                        {formMsg.text && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${formMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                {formMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                                {formMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleAssignSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Task Title</label>
                                <input required type="text" value={assignForm.title} onChange={e => setAssignForm({...assignForm, title: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., Prepare Legal Brief" />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign To (Employee ID)</label>
                                    <input required type="number" value={assignForm.assignedToId} onChange={e => setAssignForm({...assignForm, assignedToId: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., 2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Related Case ID</label>
                                    <input required type="number" value={assignForm.caseId} onChange={e => setAssignForm({...assignForm, caseId: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., 17" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Due Date</label>
                                <input required type="date" value={assignForm.dueDate} onChange={e => setAssignForm({...assignForm, dueDate: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description & Instructions</label>
                                <textarea required rows={4} value={assignForm.description} onChange={e => setAssignForm({...assignForm, description: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Provide detailed instructions..." />
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button type="submit" disabled={isAssigning} className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                                    {isAssigning ? 'Assigning...' : 'Assign Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
            {isCaseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="p-1.5 bg-amber-100 rounded-md text-amber-600"><Briefcase className="w-5 h-5" /></div>
                                Case Overview
                            </h3>
                            <button onClick={() => setIsCaseModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {isCaseLoading ? (
                                <div className="flex flex-col items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-4"></div><p className="text-slate-500">Retrieving case records...</p></div>
                            ) : caseError ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center"><AlertCircle className="w-10 h-10 text-amber-500 mb-3" /><p className="font-medium">{caseError}</p></div>
                            ) : selectedCase ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">{selectedCase.caseTitle}</h4>
                                            <p className="text-sm font-mono text-slate-500 mt-1">Case No: {selectedCase.caseNumber}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full">{selectedCase.status.replace('_', ' ')}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Case Type</label><p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.caseType?.typeName || 'N/A'}</p></div>
                                        <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filing Date</label><p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.filingDate}</p></div>
                                        <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Court</label><p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.court?.courtName || 'N/A'}</p></div>
                                        <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lawyer</label><p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.assignedLawyer}</p></div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description / Overview</label>
                                        <p className="text-sm text-slate-700 mt-1.5 leading-relaxed bg-white border border-slate-200 p-3 rounded-xl">{selectedCase.description}</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap justify-end gap-3">
                            {selectedCase?.id && selectedCase?.clientId && (
                                <button 
                                    onClick={() => handleNavigateToFolders(selectedCase.clientId, selectedCase.id)}
                                    className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                >
                                    <FolderOpen className="w-4 h-4" /> Open Case Folders
                                </button>
                            )}
                            <button onClick={() => setIsCaseModalOpen(false)} className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
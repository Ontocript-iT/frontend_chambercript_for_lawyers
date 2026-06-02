// app/dashboard/clerk/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { taskService } from '../../../_services/task/taskService';
import { Task } from '../../../models/task';
import { Clock, Briefcase, Calendar, ArrowRight, AlertCircle, CheckSquare, User } from 'lucide-react';

export default function ClerkDashboard() {
    const router = useRouter();
    const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Get user session
                const userStr = localStorage.getItem('user');
                if (!userStr) throw new Error("No active session found. Please log in.");
                const user = JSON.parse(userStr);
                setUserName(user.name || 'Clerk');

                // 2. Fetch tasks for this employee
                const allTasks = await taskService.getTasksByEmployee(user.id);
                
                // 3. Filter for pending tasks and sort by due date
                const pending = allTasks
                    .filter(t => t.status === 'PENDING')
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                
                setPendingTasks(pending);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6">
            
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                    Welcome back, {userName.split(' ')[0]}
                </h1>
                <p className="text-slate-500 mt-1.5">View your assigned tasks, manage case documentation, and update statuses.</p>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Pending Tasks Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Pending Tasks</p>
                        <h2 className="text-4xl font-black text-blue-600">
                            {isLoading ? '-' : pendingTasks.length}
                        </h2>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Clock className="w-7 h-7" />
                    </div>
                </div>
            </div>

            {/* Pending Tasks List Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                        Urgent Action Required
                    </h3>
                    <button 
                        onClick={() => router.push('/dashboard/tasks')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                    >
                        View Task Center <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                            <p className="text-slate-800 font-medium text-sm">{error}</p>
                        </div>
                    ) : pendingTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 px-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                <CheckSquare className="w-6 h-6 text-emerald-500" />
                            </div>
                            <p className="font-medium text-slate-800">No pending tasks!</p>
                            <p className="text-sm mt-1">You're all caught up with your assignments.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {pendingTasks.map((task) => (
                                <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-bold text-slate-900 truncate mb-1">{task.title}</h4>
                                        <p className="text-sm text-slate-600 line-clamp-1 mb-3">{task.description}</p>
                                        
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-md border border-red-100">
                                                <Calendar className="w-3.5 h-3.5" /> Due: {task.dueDate}
                                            </span>
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md">
                                                <Briefcase className="w-3.5 h-3.5" /> Case ID: {task.caseId}
                                            </span>
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md">
                                                <User className="w-3.5 h-3.5" /> Assigned by: {task.assignedByName}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2 md:mt-0 flex-shrink-0 w-full md:w-auto">
                                        <button 
                                            onClick={() => router.push('/dashboard/tasks')}
                                            className="w-full md:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            Process Task
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
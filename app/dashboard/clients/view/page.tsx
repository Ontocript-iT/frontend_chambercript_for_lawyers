'use client';
import { useEffect, useState } from 'react';
import { clientService } from '../../../../_services/client/clientService';
import { taskService } from '../../../../_services/task/taskService';
import { userService } from '../../../../_services/user/userService'; 
import { Client } from '../../../../models/client';
import { User } from '../../../../models/user';
import { CaseDetails } from '../../../../models/case';
import { useRouter } from 'next/navigation';
import { Search, Edit, Trash2, Mail, Phone, MapPin, Calendar, ShieldAlert, Briefcase, X, AlertCircle, FolderOpen, Gavel, ClipboardList, CheckCircle2, ChevronLeft, ChevronRight, Save, ChevronDown ,Lock} from 'lucide-react';
import { adminService } from '@/_services/admin/adminService';
import { caseWorkspaceService } from '@/_services/case/caseWorkspaceService';

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
    const [adminId, setAdminId] = useState<number>(0); 
    const [caseTypes, setCaseTypes] = useState<any[]>([]);
    const [courts, setCourts] = useState<any[]>([]);
    const [isClosingCase, setIsClosingCase] = useState(false);
    
    // --- Search State ---
    const [searchQuery, setSearchQuery] = useState('');

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(0); 
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / pageSize);

    // --- Case Modal State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<CaseDetails | null>(null);
    const [activeClientId, setActiveClientId] = useState<number | null>(null);
    const [isCaseLoading, setIsCaseLoading] = useState(false);
    const [caseError, setCaseError] = useState('');

    // --- Case Update State ---
    const [isEditingCase, setIsEditingCase] = useState(false);
    const [isUpdatingCase, setIsUpdatingCase] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        caseNumber: '',
        caseTitle: '',
        oppositeParty: '',
        filingDate: '',
        description: '',
        assignedLawyer: '',
        clientId: 0,
        caseTypeId: 0,
        courtId: 0,
        lawFirmCode: ''
    });

    // --- Searchable Dropdown States ---
    const [caseTypeSearch, setCaseTypeSearch] = useState('');
    const [isCaseTypeDropdownOpen, setIsCaseTypeDropdownOpen] = useState(false);
    const [courtSearch, setCourtSearch] = useState('');
    const [isCourtDropdownOpen, setIsCourtDropdownOpen] = useState(false);
    const [isCloseConfirmModalOpen, setIsCloseConfirmModalOpen] = useState(false);

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
            setIsLoading(true);
            setError('');
            try {
                const storedUser = localStorage.getItem('user');
                if (!storedUser) throw new Error("Authentication error: No active session.");

                const user: User = JSON.parse(storedUser);
                if (!user.lawFirmCode) throw new Error("System error: No Law Firm Code associated with your account.");
                
                setAdminId(user.id);
                setUserRole(user.role); 

                let clientsList = [];
                let count = 0;

                if (searchQuery.trim() !== '') {
                    const response = await clientService.searchClientByNin(searchQuery.trim());
                    
                    if (response && response.data) {
                        clientsList = Array.isArray(response.data) ? response.data : [response.data];
                        count = response.totalItems ?? clientsList.length;
                    } else if (Array.isArray(response)) {
                        clientsList = response;
                        count = response.length;
                    } else if (response && typeof response === 'object' && response.id) {
                        clientsList = [response];
                        count = 1;
                    }
                } else {
                    const response = await clientService.getClientsByLawFirm(user.lawFirmCode, currentPage, pageSize);
                    clientsList = response.data || [];
                    count = response.totalItems ?? 0;
                }

                const sortedClients = clientsList.sort((a: any, b: any) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                
                setClients(sortedClients);
                totalItems !== count && setTotalItems(count);
            } catch (err: any) {
                if (searchQuery.trim() !== '') {
                    setClients([]);
                    setTotalItems(0);
                } else {
                    setError(err.message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchClients();
        }, searchQuery ? 400 : 0);

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, pageSize, searchQuery]); 

    // Fetch dropdown data on mount
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const typesRes = await caseWorkspaceService.getCaseTypes();
                if (typesRes?.data) setCaseTypes(typesRes.data);

                const courtsRes = await caseWorkspaceService.getAllCourts();
                if (courtsRes?.data) setCourts(courtsRes.data);
            } catch (err) {
                console.error("Failed to load case types or courts for the dropdowns.", err);
            }
        };

        fetchDropdownData();
    }, []);


 // Opens the custom confirmation modal
    const handleCloseCaseToggle = () => {
        if (!selectedCase?.id) return;
        setIsCloseConfirmModalOpen(true);
        setCaseError('');
    };

    // Executes the actual API call when confirmed
    const confirmCloseCase = async () => {
        if (!selectedCase?.id) return;
        
        setIsClosingCase(true);
        setCaseError('');

        try {
            await caseWorkspaceService.updateCaseStatus(selectedCase.id, 'CLOSED');
            
            setSelectedCase({
                ...selectedCase,
                status: 'CLOSED'
            });
            
            // Close the confirmation modal on success
            setIsCloseConfirmModalOpen(false);
        } catch (err: any) {
            setCaseError(err.message || "Failed to close the case.");
        } finally {
            setIsClosingCase(false);
        }
    };
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
        setIsEditingCase(false);
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
        setIsEditingCase(false);
    };

    // --- Case Update Handlers ---
    const handleEnableEdit = () => {
        if (!selectedCase) return;
        const storedUser = localStorage.getItem('user');
        const user: User = storedUser ? JSON.parse(storedUser) : null;

        setUpdateForm({
            caseNumber: selectedCase.caseNumber || '',
            caseTitle: selectedCase.caseTitle || '',
            oppositeParty: (selectedCase as any).oppositeParty || '',
            filingDate: selectedCase.filingDate || '',
            description: selectedCase.description || '',
            assignedLawyer: selectedCase.assignedLawyer || '',
            clientId: activeClientId || 0,
            caseTypeId: selectedCase.caseType?.id || 0,
            courtId: selectedCase.court?.id || 0,
            lawFirmCode: user?.lawFirmCode || ''
        });
        setIsEditingCase(true);
    };

 const handleUpdateCaseSubmit = async () => {
        if (!selectedCase) return;
        setIsUpdatingCase(true);
        setCaseError('');
        
        try {
            // STRICT NESTED PAYLOAD: No flat numbers allowed for relational data
const payloadToBackend = {
    caseNumber: updateForm.caseNumber,
    caseTitle: updateForm.caseTitle,
    oppositeParty: updateForm.oppositeParty,
    filingDate: updateForm.filingDate,
    description: updateForm.description,
    assignedLawyer: updateForm.assignedLawyer,
    lawFirmCode: updateForm.lawFirmCode,
  
    clientId: updateForm.clientId, 
    
    caseTypeId: { id: updateForm.caseTypeId }, 

    courtId: { id: updateForm.courtId } 
};

console.log("Law Firm Code being sent:", updateForm.lawFirmCode);
console.log("Payload length:", updateForm.lawFirmCode.length);

            await caseWorkspaceService.updateCase(selectedCase.id, payloadToBackend);

            setSelectedCase({
                ...selectedCase,
                caseNumber: updateForm.caseNumber,
                caseTitle: updateForm.caseTitle,
                filingDate: updateForm.filingDate,
                description: updateForm.description,
                assignedLawyer: updateForm.assignedLawyer,
                caseType: caseTypes.find(t => t.id === updateForm.caseTypeId) || selectedCase.caseType,
                court: courts.find(c => c.id === updateForm.courtId) || selectedCase.court
            });
            setIsEditingCase(false);
        } catch (err: any) {
            setCaseError(err.message || "An error occurred while updating.");
        } finally {
            setIsUpdatingCase(false);
        }
    };

    // --- Task Delegation Handlers ---
    const openAssignTaskModal = async (clientId: number) => {
        setIsTaskModalOpen(true);
        setTaskMsg({ type: '', text: '' });
        
        try {
            const caseData = await clientService.getCaseByClientId(clientId);
            const activeCaseId = caseData?.id || '';
            setTaskForm(prev => ({ ...prev, caseId: activeCaseId.toString() }));

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

    // --- Pagination Handlers ---
    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0); 
    };

    const handleNavigateToHearing = async (clientId: number) => {
    try {
        // Fetch the active case for this client first
        const caseData = await clientService.getCaseByClientId(clientId);

        console.log("Fetched case data for hearing navigation:", clientId);
        
        if (caseData && caseData.id) {
            // Navigate using the retrieved case.id
            router.push(`/dashboard/cases/${caseData.id}/hearings`);
        } else {
            alert("No active case found for this client.");
        }
    } catch (err) {
        console.error("Error fetching case for hearing navigation:", err);
        alert("Failed to load case details. Please try again.");
    }
};

    // Derived states for filtered dropdowns
    const filteredCaseTypes = caseTypes.filter(type => 
        type.typeName.toLowerCase().includes(caseTypeSearch.toLowerCase())
    );
    const filteredCourts = courts.filter(court => 
        court.courtName.toLowerCase().includes(courtSearch.toLowerCase()) || 
        court.location.toLowerCase().includes(courtSearch.toLowerCase())
    );

    if (isLoading && clients.length === 0) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div></div>;
    if (error) return <div className="flex flex-col items-center justify-center py-16 text-center"><ShieldAlert className="w-12 h-12 text-red-500 mb-4" /><h3 className="text-xl font-bold">No Clients Found</h3><p>{error}</p></div>;

    return (
        <div>
            {/* Search Bar Area */}
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 rounded-t-xl">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(0);
                        }}
                        placeholder="Search by client NIC number..." 
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 text-slate-500 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
                    />
                    {isLoading && searchQuery && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-amber-600"></div>
                    )}
                </div>
                <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    {searchQuery ? 'Matches Found: ' : 'Total Clients: '}{totalItems}
                </span>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto bg-white rounded-b-xl shadow-sm border border-slate-200 border-t-0">
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
                            <tr><td colSpan={4} className="py-12 text-center text-slate-500">No clients found matching that lookup metric.</td></tr>
                        ) : (
                            clients.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-slate-900">{client.name}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">NIC: {client.nic}</div>
                                    </td>
                                    <td className="py-4 px-6 space-y-1.5">
                                        <div className="flex items-center text-sm text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" /> <span className="truncate max-w-[180px]">{client.email || 'N/A'}</span></div>
                                        <div className="flex items-center text-sm text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" /> {client.phone}</div>
                                    </td>
                                    <td className="py-4 px-6 space-y-1.5">
                                        <div className="flex items-center text-sm text-slate-600"><Calendar className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" /> {formatDate(client.createdAt)}</div>
                                        <div className="flex items-start text-sm text-slate-500"><MapPin className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" /> <span className="truncate max-w-[180px] text-xs">{client.address}</span></div>
                                    </td>
                                    <td className="py-4 px-6 text-right space-x-2 flex justify-end">
                                        {userRole === 'ADMIN' && (
                                            <button 
                                                onClick={() => openAssignTaskModal(client.id)} 
                                                title="Delegate Task" 
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-100 group-hover:opacity-100"
                                            >
                                                <ClipboardList className="w-4 h-4" />
                                            </button>
                                        )}
                                        
                                        <button onClick={() => handleQuickViewFolders(client.id)} title="View Folders" className="p-2 text-slate-400 hover:text-emerald-600  hover:bg-emerald-50 rounded-lg transition-all opacity-100 group-hover:opacity-100">
                                            <FolderOpen className="w-4 h-4" />
                                        </button>
<button 
    onClick={() => handleNavigateToHearing(client.id)} 
    title="View Hearings" 
    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all opacity-100 group-hover:opacity-100"
>
    <Gavel className="w-4 h-4" />
</button>
                                        <button onClick={() => handleViewCase(client.id, client.name)} title="View Case Brief" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all opacity-100 group-hover:opacity-100">
                                            <Briefcase className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {/* Pagination Controls */}
                {clients.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-xl">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Rows per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    disabled={!!searchQuery}
                                    className="border border-slate-300 rounded-md bg-white text-sm text-slate-700 py-1 pl-2 pr-6 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value={2}>2</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <div className="text-sm text-slate-600 hidden sm:block">
                                Showing <span className="font-medium text-slate-900">{totalItems === 0 ? 0 : currentPage * pageSize + 1}</span> to <span className="font-medium text-slate-900">{Math.min((currentPage + 1) * pageSize, totalItems)}</span> of <span className="font-medium text-slate-900">{totalItems}</span> entries
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 0 || !!searchQuery}
                                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-medium text-slate-700 px-2">
                                Page {currentPage + 1} of {Math.max(1, totalPages)}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages - 1 || totalPages === 0 || !!searchQuery}
                                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
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
                                <label className="block text-sm text-black font-medium mb-1">Task Title</label>
                                <input required type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:ring-2 text-slate-500 focus:ring-blue-500" placeholder="e.g., Draft legal brief" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-black font-medium mb-1">Assign To</label>
                                    <select required value={taskForm.assignedToId} onChange={e => setTaskForm({...taskForm, assignedToId: e.target.value})} className="w-full border p-2 rounded-lg outline-none text-slate-500 focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="" disabled>Select Staff...</option>
                                        {employees.map((emp: any) => (
                                            <option key={emp.userId} value={emp.userId}>{emp.name} ({emp.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-black font-medium mb-1">Due Date</label>
                                    <input required type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="w-full border p-2 rounded-lg text-slate-500 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Task Description</label>
                                <textarea required rows={3} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:ring-2 text-slate-500 focus:ring-blue-500" placeholder="Instructions..." />
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

            {/* --- Case Overview & Edit Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-amber-600" /> 
                                {isEditingCase ? 'Quick Update Case' : 'Case Overview'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 min-h-[300px]">
                            {isCaseLoading ? (
                                <div className="flex flex-col items-center justify-center h-full py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-4"></div></div>
                            ) : caseError ? (
                                <div className="flex flex-col items-center justify-center h-full py-12 text-center"><AlertCircle className="w-10 h-10 text-amber-500 mb-3" /><p className="font-medium text-slate-700">{caseError}</p></div>
                            ) : selectedCase ? (
                                isEditingCase ? (
                                    /* Edit Mode Form */
                                    <div className="space-y-4 relative">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase">Case Number</label>
                                                <input type="text" value={updateForm.caseNumber} onChange={(e) => setUpdateForm({...updateForm, caseNumber: e.target.value})} className="w-full mt-1 border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 text-slate-700 focus:ring-amber-500" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase">Case Title</label>
                                                <input type="text" value={updateForm.caseTitle} onChange={(e) => setUpdateForm({...updateForm, caseTitle: e.target.value})} className="w-full mt-1 border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 text-slate-700 focus:ring-amber-500" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase">Opposite Party</label>
                                                <input type="text" value={updateForm.oppositeParty} onChange={(e) => setUpdateForm({...updateForm, oppositeParty: e.target.value})} className="w-full mt-1 border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 text-slate-700 focus:ring-amber-500" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase">Filing Date</label>
                                                <input type="date" value={updateForm.filingDate} onChange={(e) => setUpdateForm({...updateForm, filingDate: e.target.value})} className="w-full mt-1 border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 text-slate-700 focus:ring-amber-500" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase">Assigned Lawyer</label>
                                                <input type="text" value={updateForm.assignedLawyer} onChange={(e) => setUpdateForm({...updateForm, assignedLawyer: e.target.value})} className="w-full mt-1 border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 text-slate-700 focus:ring-amber-500" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 relative">
                                                {/* --- Custom Searchable Case Type Dropdown --- */}
                                                <div className="relative">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase">Case Type</label>
                                                    
                                                    {/* Invisible backdrop to close dropdowns when clicking outside */}
                                                    {isCaseTypeDropdownOpen && (
                                                        <div className="fixed inset-0 z-10" onClick={() => setIsCaseTypeDropdownOpen(false)}></div>
                                                    )}

                                                    <div 
                                                        className="w-full mt-1 border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 text-slate-700 focus:ring-amber-500 bg-white cursor-pointer flex justify-between items-center relative z-20"
                                                        onClick={() => {
                                                            setIsCaseTypeDropdownOpen(!isCaseTypeDropdownOpen);
                                                            if (isCourtDropdownOpen) setIsCourtDropdownOpen(false);
                                                        }}
                                                    >
                                                        <span className="truncate pr-2">
                                                            {caseTypes.find(type => type.id === updateForm.caseTypeId)?.typeName || "Select Case Type..."}
                                                        </span>
                                                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                    </div>

                                                    {isCaseTypeDropdownOpen && (
                                                        <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                            <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Search case type..."
                                                                    className="w-full border border-slate-300 rounded-md p-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                                                                    value={caseTypeSearch}
                                                                    onChange={(e) => setCaseTypeSearch(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()} 
                                                                />
                                                            </div>
                                                            <div className="py-1">
                                                                {filteredCaseTypes.length > 0 ? filteredCaseTypes.map((type) => (
                                                                    <div 
                                                                        key={type.id} 
                                                                        className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                                                                        onClick={() => {
                                                                            setUpdateForm({...updateForm, caseTypeId: type.id});
                                                                            setIsCaseTypeDropdownOpen(false);
                                                                            setCaseTypeSearch('');
                                                                        }}
                                                                    >
                                                                        {type.typeName}
                                                                    </div>
                                                                )) : (
                                                                    <div className="px-3 py-2 text-sm text-slate-500 italic">No matches found.</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* --- Custom Searchable Court Dropdown --- */}
                                                <div className="relative">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase">Court</label>
                                                    
                                                    {isCourtDropdownOpen && (
                                                        <div className="fixed inset-0 z-10" onClick={() => setIsCourtDropdownOpen(false)}></div>
                                                    )}

                                                    <div 
                                                        className="w-full mt-1 border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 text-slate-700 focus:ring-amber-500 bg-white cursor-pointer flex justify-between items-center relative z-20"
                                                        onClick={() => {
                                                            setIsCourtDropdownOpen(!isCourtDropdownOpen);
                                                            if (isCaseTypeDropdownOpen) setIsCaseTypeDropdownOpen(false);
                                                        }}
                                                    >
                                                        <span className="truncate pr-2">
                                                            {(() => {
                                                                const selectedCourt = courts.find(court => court.id === updateForm.courtId);
                                                                return selectedCourt ? `${selectedCourt.courtName} - ${selectedCourt.location}` : "Select Court...";
                                                            })()}
                                                        </span>
                                                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                    </div>

                                                    {isCourtDropdownOpen && (
                                                        <div className="absolute z-30 w-[150%] right-0 sm:w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                            <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Search court or location..."
                                                                    className="w-full border border-slate-300 rounded-md p-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                                                                    value={courtSearch}
                                                                    onChange={(e) => setCourtSearch(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()} 
                                                                />
                                                            </div>
                                                            <div className="py-1">
                                                                {filteredCourts.length > 0 ? filteredCourts.map((court) => (
                                                                    <div 
                                                                        key={court.id} 
                                                                        className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                                                                        onClick={() => {
                                                                            setUpdateForm({...updateForm, courtId: court.id});
                                                                            setIsCourtDropdownOpen(false);
                                                                            setCourtSearch('');
                                                                        }}
                                                                    >
                                                                        <div className="font-medium">{court.courtName}</div>
                                                                        <div className="text-xs text-slate-500">{court.location}</div>
                                                                    </div>
                                                                )) : (
                                                                    <div className="px-3 py-2 text-sm text-slate-500 italic">No matches found.</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                                            <textarea rows={3} value={updateForm.description} onChange={(e) => setUpdateForm({...updateForm, description: e.target.value})} className="w-full mt-1 border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 text-slate-700 focus:ring-amber-500"></textarea>
                                        </div>
                                    </div>
                                ) : (
                                    /* View Mode Content */
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-xl font-bold text-slate-900">{selectedCase.caseTitle}</h4>
                                                <p className="text-sm font-mono text-slate-500 mt-1">Case No: {selectedCase.caseNumber}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full">{selectedCase.status.replace('_', ' ')}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <div><label className="text-xs font-semibold text-slate-500 uppercase">Case Type</label><p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.caseType?.typeName || 'N/A'}</p></div>
                                            <div><label className="text-xs font-semibold text-slate-500 uppercase">Filing Date</label><p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.filingDate}</p></div>
                                            <div><label className="text-xs font-semibold text-slate-500 uppercase">Assigned Court</label><p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.court?.courtName || 'N/A'}</p></div>
                                            <div><label className="text-xs font-semibold text-slate-500 uppercase">Assigned Lawyer</label><p className="text-sm font-medium text-slate-700 mt-0.5">{selectedCase.assignedLawyer}</p></div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Description / Overview</label>
                                            <p className="text-sm text-slate-700 mt-1.5 leading-relaxed bg-white border border-slate-200 p-4 rounded-lg">{selectedCase.description}</p>
                                        </div>
                                    </div>
                                )
                            ) : null}
                        </div>
{/* Modal Footer Controls */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center gap-3">
                            <div className="flex gap-2">
                                {!isEditingCase && selectedCase?.id && activeClientId && (
                                    <>
                                        <button 
                                            onClick={() => handleNavigateToFolders(activeClientId, selectedCase.id)}
                                            className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                        >
                                            <FolderOpen className="w-4 h-4" /> Folders
                                        </button>
                                        <button 
                                            onClick={() => router.push(`/dashboard/cases/${selectedCase.id}/hearings`)}
                                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <Gavel className="w-4 h-4" /> Hearings
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                {isEditingCase ? (
                                    <>
                                        <button onClick={() => setIsEditingCase(false)} className="px-6 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={handleUpdateCaseSubmit} disabled={isUpdatingCase} className="px-6 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                                            <Save className="w-4 h-4" /> {isUpdatingCase ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* NEW: Close Case Button (Hidden if already CLOSED) */}
                                        {selectedCase?.id && selectedCase.status !== 'CLOSED' && (
                                            <button 
                                                onClick={handleCloseCaseToggle} 
                                                disabled={isClosingCase}
                                                className="px-6 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isClosingCase ? (
                                                    <div className="w-4 h-4 border-2 border-t-transparent border-red-700 rounded-full animate-spin"></div>
                                                ) : (
                                                    <Lock className="w-4 h-4" />
                                                )}
                                                Close Case
                                            </button>
                                        )}

                                        {/* Existing Quick Update and Close Buttons */}
                                        {selectedCase?.id && (
                                            <button onClick={handleEnableEdit} className="px-6 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2">
                                                <Edit className="w-4 h-4" /> Quick Update
                                            </button>
                                        )}
                                        <button onClick={closeModal} className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                                            Close
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --- Close Case Confirmation Modal --- */}
            {isCloseConfirmModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-red-50">
                            <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                                Confirm Case Closure
                            </h3>
                            <button onClick={() => setIsCloseConfirmModalOpen(false)} className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-800 font-medium mb-2">Are you sure you want to mark this case as CLOSED?</p>
                            <p className="text-sm text-slate-500 mb-6">This action will lock the case status. You will still be able to view the case details and associated documents.</p>
                            
                            {caseError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
                                    {caseError}
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => setIsCloseConfirmModalOpen(false)}
                                    className="px-5 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmCloseCase}
                                    disabled={isClosingCase}
                                    className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isClosingCase ? (
                                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                    Yes, Close Case
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
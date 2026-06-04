
'use client';

import { useState, useEffect } from 'react';
import { caseWorkspaceService } from '../../../../_services/case/caseWorkspaceService';
import { Briefcase, FolderPlus, FileUp, CheckCircle2, ChevronRight, UserPlus, User } from 'lucide-react';

export default function CaseOnboardingWizard() {
    // Session State
    const [userId, setUserId] = useState<string>("");
    const [userFirmCode, setUserFirmCode] = useState<string>('');

    // Wizard Progression State
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Context IDs saved as we progress through the APIs
    const [activeClientId, setActiveClientId] = useState<number | null>(null);
    const [activeClientName, setActiveClientName] = useState<string>('');
    const [activeCaseId, setActiveCaseId] = useState<number | null>(null);
    const [mainFolderId, setMainFolderId] = useState<number | null>(null);
    const [subFolderId, setSubFolderId] = useState<number | null>(null);

    // Form States
    const [clientForm, setClientForm] = useState({
        name: '', nic: '', password: '', phone: '', email: '', address: '', notes: ''
    });
    
    const [caseForm, setCaseForm] = useState({
        caseNumber: '', caseTitle: '', oppositeParty: '', filingDate: '', 
        description: '', assignedLawyer: '', caseTypeId: '1', courtId: '1'
    });
    
    const [folderForm, setFolderForm] = useState({ mainFolderName: '01_Pleadings', subFolderName: 'Medical Records' });
    
    const [docForm, setDocForm] = useState({ file: null as File | null, documentType: 'Evidence', version: 'v1.0' });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setUserId(parsedUser.email);
            if (parsedUser.lawFirmCode) setUserFirmCode(parsedUser.lawFirmCode);
        }
    }, []);

    // --- Handlers ---

    // STEP 1: Register Client
    const handleClientSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true); setError('');
        try {
            const res = await caseWorkspaceService.registerClient(clientForm);
            setActiveClientId(res.id); // From response { id: 3, ... }
            setActiveClientName(clientForm.name);
            setCurrentStep(2); // Move to Case
        } catch (err: any) {
            setError(err.message);
        } finally { setIsLoading(false); }
    };

    // STEP 2: Register Case
    const handleCaseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeClientId) return setError("System Error: Missing Client Context.");
        
        setIsLoading(true); setError('');
        try {
            const payload = {
                ...caseForm,
                clientId: activeClientId, // Automatically injected from Step 1
                caseTypeId: Number(caseForm.caseTypeId),
                courtId: Number(caseForm.courtId)
            };
            const res = await caseWorkspaceService.registerCase(payload);
            
            setActiveCaseId(res.data.id);
            setCurrentStep(3); // Move to Folders
        } catch (err: any) {
            setError(err.message);
        } finally { setIsLoading(false); }
    };

    // STEP 3: Create Folders
    const handleFolderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true); setError('');
        try {
            if (!activeCaseId || !activeClientId) throw new Error("Missing Context");

            const mainRes = await caseWorkspaceService.createFolder({
                name: folderForm.mainFolderName,
                caseId: activeCaseId,
                clientId: activeClientId,
                parentFolderId: null
            });
            const createdMainId = mainRes.folder.id;
            setMainFolderId(createdMainId);

            const subRes = await caseWorkspaceService.createFolder({
                name: folderForm.subFolderName,
                caseId: activeCaseId,
                clientId: activeClientId,
                parentFolderId: createdMainId
            });
            setSubFolderId(subRes.folder.id);
            
            setCurrentStep(4); // Move to Upload
        } catch (err: any) {
            setError(err.message);
        } finally { setIsLoading(false); }
    };

    // STEP 4: Upload Document (Optional)
    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docForm.file || !subFolderId) return setError("Please select a file.");
        if (!userFirmCode) return setError("System Error: Law firm code missing from session."); 
        
        setIsLoading(true); setError('');
        try {
            await caseWorkspaceService.uploadDocument({
                file: docForm.file,
                documentType: docForm.documentType,
                version: docForm.version,
                uploadedBy: userId,
                folderId: subFolderId,
                lawFirmCode: userFirmCode 
            });
            setCurrentStep(5); // Success Page
        } catch (err: any) {
            setError(err.message);
        } finally { setIsLoading(false); }
    };

    const handleSkipUpload = () => {
        setCurrentStep(5); // Instantly bypass to success
    };

    // --- UI Renderers ---
    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">New Case Onboarding</h1>
            <p className="text-slate-500 mb-8">Follow the steps to register the client, case, and initialize the workspace.</p>

            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                {[
                    { step: 1, label: 'Client', icon: UserPlus },
                    { step: 2, label: 'Case', icon: Briefcase },
                    { step: 3, label: 'Workspace', icon: FolderPlus },
                    { step: 4, label: 'Upload (Opt)', icon: FileUp },
                ].map((s) => (
                    <div key={s.step} className={`flex items-center gap-2 flex-shrink-0 ${currentStep >= s.step ? 'text-amber-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= s.step ? 'bg-amber-100' : 'bg-slate-100'}`}>
                            <s.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                        {s.step < 4 && <ChevronRight className="w-4 h-4 mx-2 sm:mx-4 text-slate-300" />}
                    </div>
                ))}
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">{error}</div>}

            {/* STEP 1: Client Registration */}
            {currentStep === 1 && (
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 border-b pb-2">1. Register New Client</h2>
                    <form onSubmit={handleClientSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm text-black font-medium mb-1">Full Name</label><input required type="text" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full border  text-slate-500 rounded-lg p-2" /></div>
                            <div><label className="block text-sm text-black font-medium mb-1">NIC</label><input required type="text" value={clientForm.nic} onChange={e => setClientForm({...clientForm, nic: e.target.value})} className="w-full text-slate-500 border rounded-lg p-2" /></div>
                            {/* <div><label className="block text-sm text-black font-medium mb-1">Email</label><input required type="email" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} className="w-full border rounded-lg p-2" /></div> */}
                            <div><label className="block text-sm text-black font-medium mb-1">Phone</label><input required type="text" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} className="w-full text-slate-500 border rounded-lg p-2" /></div>
                            <div className="md:col-span-2"><label className="block text-sm text-black font-medium mb-1">Address</label><input required type="text" value={clientForm.address} onChange={e => setClientForm({...clientForm, address: e.target.value})} className="w-full text-slate-500 border rounded-lg p-2" /></div>
                            <div className="md:col-span-2"><label className="block text-sm text-black font-medium mb-1">Notes</label><textarea rows={2} value={clientForm.notes} onChange={e => setClientForm({...clientForm, notes: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" /></div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white p-3 rounded-lg hover:bg-amber-600 transition">{isLoading ? 'Registering...' : 'Register Client & Continue'}</button>
                    </form>
                </div>
            )}

            {/* STEP 2: Case Registration */}
            {currentStep === 2 && (
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">2. Register Case Details</h2>
                    
                    {/* Context Banner */}
                    <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-lg mb-6 border border-amber-100 text-amber-800">
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">Linking case to newly registered client: <strong>{activeClientName}</strong></span>
                    </div>

                    <form onSubmit={handleCaseSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-black text-sm font-medium mb-1">Case Number</label><input required type="text" value={caseForm.caseNumber} onChange={e => setCaseForm({...caseForm, caseNumber: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" placeholder="e.g., HC/CIV/2026/045" /></div>
                            <div><label className="block text-black text-sm font-medium mb-1">Case Title</label><input required type="text" value={caseForm.caseTitle} onChange={e => setCaseForm({...caseForm, caseTitle: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" placeholder="Doe vs. ABC Corp" /></div>
                            <div><label className="block text-black text-sm font-medium mb-1">Opposite Party</label><input required type="text" value={caseForm.oppositeParty} onChange={e => setCaseForm({...caseForm, oppositeParty: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" /></div>
                            <div><label className="block text-black text-sm font-medium mb-1">Filing Date</label><input required type="date" value={caseForm.filingDate} onChange={e => setCaseForm({...caseForm, filingDate: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" /></div>
                            <div><label className="block text-black text-sm font-medium mb-1">Assigned Lawyer</label><input required type="text" value={caseForm.assignedLawyer} onChange={e => setCaseForm({...caseForm, assignedLawyer: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" /></div>
                            
                            <div><label className="block text-black text-sm font-medium mb-1">Case Type</label><select value={caseForm.caseTypeId} onChange={e => setCaseForm({...caseForm, caseTypeId: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2"><option value="1">Civil</option><option value="2">Criminal</option></select></div>
                            <div className="md:col-span-2"><label className="block text-black text-sm font-medium mb-1">Description</label><textarea required rows={3} value={caseForm.description} onChange={e => setCaseForm({...caseForm, description: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" /></div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full text-black bg-slate-900 text-white p-3 rounded-lg hover:bg-amber-600 transition">{isLoading ? 'Registering...' : 'Register Case & Continue'}</button>
                    </form>
                </div>
            )}

            {/* STEP 3: Folder Creation */}
            {currentStep === 3 && (
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 border-b pb-2">3. Initialize Workspace Folders</h2>
                    <div className="bg-amber-50 p-4 rounded-lg mb-6 text-sm text-amber-800">
                        Case <strong>#{activeCaseId}</strong> created successfully. Let's set up the digital repository.
                    </div>
                    <form onSubmit={handleFolderSubmit} className="space-y-6">
                        <div><label className="block text-black text-sm font-medium mb-1">Main Folder Name</label><input required type="text" value={folderForm.mainFolderName} onChange={e => setFolderForm({...folderForm, mainFolderName: e.target.value})} className="w-full text-slate-500 border rounded-lg p-2" /></div>
                        <div><label className="block text-black text-sm font-medium mb-1">Sub-Folder Name</label><input required type="text" value={folderForm.subFolderName} onChange={e => setFolderForm({...folderForm, subFolderName: e.target.value})} className="w-full text-slate-500 border rounded-lg p-2" /></div>
                        <button type="submit" disabled={isLoading} className="w-full text-black bg-slate-900 text-white p-3 rounded-lg hover:bg-amber-600 transition">{isLoading ? 'Creating Structure...' : 'Create Folders & Continue'}</button>
                    </form>
                </div>
            )}

            {/* STEP 4: Document Upload (Optional) */}
            {currentStep === 4 && (
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 border-b pb-2">4. Upload Initial Document <span className="text-sm font-normal text-slate-500">(Optional)</span></h2>
                    <form onSubmit={handleUploadSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm text-black font-medium mb-1">Select File</label>
                            <input type="file" onChange={e => setDocForm({...docForm, file: e.target.files?.[0] || null})} className="w-full border rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="block text-sm text-black font-medium mb-1">Document Type</label><input type="text" value={docForm.documentType} onChange={e => setDocForm({...docForm, documentType: e.target.value})} className="w-full text-slate-500 border rounded-lg p-2" /></div>
                            <div><label className="block text-sm text-black font-medium mb-1">Version</label><input type="text" value={docForm.version} onChange={e => setDocForm({...docForm, version: e.target.value})} className="w-full text-slate-500 border rounded-lg p-2" /></div>
                        </div>
                        
                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            {/* Skip Button */}
                            <button type="button" onClick={handleSkipUpload} disabled={isLoading} className="flex-1 bg-slate-100 text-slate-700 p-3 rounded-lg hover:bg-slate-200 transition font-medium">
                                Skip Upload
                            </button>
                            {/* Submit Upload Button */}
                            <button type="submit" disabled={isLoading || !docForm.file} className="flex-1 bg-slate-900 text-white p-3 rounded-lg hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition font-medium">
                                {isLoading ? 'Uploading...' : 'Upload & Finish'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* STEP 5: Success */}
            {currentStep === 5 && (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Onboarding Complete</h2>
                    <p className="text-slate-500 mb-8">Client <strong>{activeClientName}</strong> and Case <strong>#{activeCaseId}</strong> have been successfully registered into the system.</p>
                    <button onClick={() => window.location.reload()} className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition font-medium">Start New Onboarding</button>
                </div>
            )}
        </div>
    );
}
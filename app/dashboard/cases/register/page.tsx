'use client';

import { useState, useEffect } from 'react';
import { caseWorkspaceService } from '../../../../_services/case/caseWorkspaceService';
import { Briefcase, FolderPlus, FileUp, CheckCircle2, ChevronRight, UserPlus, User, X } from 'lucide-react';

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

    // Preview Modal State
    const [showPreview, setShowPreview] = useState(false);
    const [previewStep, setPreviewStep] = useState<1 | 2 | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setUserId(parsedUser.email);
            if (parsedUser.lawFirmCode) setUserFirmCode(parsedUser.lawFirmCode);
        }
    }, []);

    const handleClientFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation Regex Patterns
        const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
        const phoneRegex = /^(?:\+94|0)?7\d{8}$/; 

        // Validate NIC
        if (!nicRegex.test(clientForm.nic.trim())) {
            setError("Invalid NIC format. Please enter a valid Sri Lankan NIC (e.g., 123456789V or 199012345678).");
            return;
        }

        // Validate Phone
        if (!phoneRegex.test(clientForm.phone.trim())) {
            setError("Invalid mobile number format. Please enter a valid Sri Lankan number (e.g., 0771234567 or +94771234567).");
            return;
        }

        setError('');

        setPreviewStep(1);
        setShowPreview(true);
    };

    const handleCaseFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPreviewStep(2);
        setShowPreview(true);
    };


    // --- Actual API Handlers ---

    // STEP 1: Register Client
    const confirmClientSubmit = async () => {
        setShowPreview(false);
        if (!userFirmCode) return setError("System Error: Law firm code missing from session. Please log in again.");

        setIsLoading(true); 
        setError('');
        try {
            // FIX: Added lawFirmCode to bypass 403 Forbidden security checks
            const clientPayload = {
                ...clientForm,
                lawFirmCode: userFirmCode 
            };

            const res = await caseWorkspaceService.registerClient(clientPayload);
            setActiveClientId(res.id); 
            setActiveClientName(clientForm.name);
            setCurrentStep(2); 
        } catch (err: any) {
            setError(err.message || "403 Forbidden: Check if your login session has expired.");
        } finally { setIsLoading(false); }
    };

    // STEP 2: Register Case
    const confirmCaseSubmit = async () => {
        setShowPreview(false);
        if (!activeClientId) return setError("System Error: Missing Client Context.");
        if (!userFirmCode) return setError("System Error: Missing Law Firm Code.");
        
        setIsLoading(true); 
        setError('');
        try {
            const payload = {
                caseNumber: caseForm.caseNumber,
                caseTitle: caseForm.caseTitle,
                oppositeParty: caseForm.oppositeParty,
                filingDate: caseForm.filingDate,
                description: caseForm.description,
                assignedLawyer: caseForm.assignedLawyer,
                lawFirmCode: userFirmCode, 
                clientId: activeClientId, 
                caseTypeId: { id: Number(caseForm.caseTypeId) }, 
                courtId: { id: Number(caseForm.courtId) } ,
                
                
            };

            const res = await caseWorkspaceService.registerCase(payload);
            setActiveCaseId(res.data.id);
            setCurrentStep(3); 
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
            
            setCurrentStep(4); 
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
            setCurrentStep(5); 
        } catch (err: any) {
            setError(err.message);
        } finally { setIsLoading(false); }
    };

    const handleSkipUpload = () => {
        setCurrentStep(5); 
    };

    // --- UI Renderers ---
    return (
        <div className="max-w-5xl mx-auto py-8 px-4 relative">
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
                    <form onSubmit={handleClientFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm text-black font-medium mb-1">Full Name</label><input required type="text" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full border  text-slate-500 rounded-lg p-2" /></div>
                            <div><label className="block text-sm text-black font-medium mb-1">NIC</label><input required type="text" value={clientForm.nic} onChange={e => setClientForm({...clientForm, nic: e.target.value})} className="w-full text-slate-500 border rounded-lg p-2" /></div>
                            <div><label className="block text-sm text-black font-medium mb-1">Phone</label><input required type="text" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} className="w-full text-slate-500 border rounded-lg p-2" /></div>
                            <div className="md:col-span-2"><label className="block text-sm text-black font-medium mb-1">Address</label><input required type="text" value={clientForm.address} onChange={e => setClientForm({...clientForm, address: e.target.value})} className="w-full text-slate-500 border rounded-lg p-2" /></div>
                            <div className="md:col-span-2"><label className="block text-sm text-black font-medium mb-1">Notes</label><textarea rows={2} value={clientForm.notes} onChange={e => setClientForm({...clientForm, notes: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" /></div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white p-3 rounded-lg hover:bg-amber-600 transition">{isLoading ? 'Processing...' : 'Review Client Details'}</button>
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

                    <form onSubmit={handleCaseFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-black text-sm font-medium mb-1">Case Number</label><input required type="text" value={caseForm.caseNumber} onChange={e => setCaseForm({...caseForm, caseNumber: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" placeholder="e.g., HC/CIV/2026/045" /></div>
                            <div><label className="block text-black text-sm font-medium mb-1">Case Title</label><input required type="text" value={caseForm.caseTitle} onChange={e => setCaseForm({...caseForm, caseTitle: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" placeholder="Doe vs. ABC Corp" /></div>
                            <div><label className="block text-black text-sm font-medium mb-1">Opposite Party</label><input required type="text" value={caseForm.oppositeParty} onChange={e => setCaseForm({...caseForm, oppositeParty: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" /></div>
                            <div><label className="block text-black text-sm font-medium mb-1">Filing Date</label><input required type="date" value={caseForm.filingDate} onChange={e => setCaseForm({...caseForm, filingDate: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" /></div>
                            <div><label className="block text-black text-sm font-medium mb-1">Assigned Lawyer</label><input required type="text" value={caseForm.assignedLawyer} onChange={e => setCaseForm({...caseForm, assignedLawyer: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" /></div>
                            
                            <div><label className="block text-black text-sm font-medium mb-1">Case Type</label><select value={caseForm.caseTypeId} onChange={e => setCaseForm({...caseForm, caseTypeId: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2"><option value="1">Civil</option><option value="2">Criminal</option><option value="3">Fundamental Rights</option><option value="4">Property & Land</option><option value="5">Family & Divorce</option></select></div>
                            <div><label className="block text-black text-sm font-medium mb-1">Court</label><select value={caseForm.courtId} onChange={e => setCaseForm({...caseForm, courtId: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2"><option value="1">Supreme Court</option><option value="2">Court of Appeal</option><option value="3">High Court</option><option value="4">District Court</option></select></div>
                            <div className="md:col-span-2"><label className="block text-black text-sm font-medium mb-1">Description</label><textarea required rows={20} value={caseForm.description} onChange={e => setCaseForm({...caseForm, description: e.target.value})} className="w-full border text-slate-500 rounded-lg p-2" /></div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full text-black bg-slate-900 text-white p-3 rounded-lg hover:bg-amber-600 transition">{isLoading ? 'Processing...' : 'Review Case Details'}</button>
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

            {/* --- PREVIEW MODAL --- */}
            {showPreview && previewStep !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                Confirm {previewStep === 1 ? 'Client' : 'Case'} Details
                            </h3>
                            <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {previewStep === 1 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label><p className="text-sm font-medium text-slate-900 mt-1">{clientForm.name}</p></div>
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase">NIC</label><p className="text-sm font-medium text-slate-900 mt-1">{clientForm.nic}</p></div>
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Phone</label><p className="text-sm font-medium text-slate-900 mt-1">{clientForm.phone}</p></div>
                                    <div className="sm:col-span-2"><label className="text-xs font-semibold text-slate-500 uppercase">Address</label><p className="text-sm font-medium text-slate-900 mt-1">{clientForm.address}</p></div>
                                    {clientForm.notes && <div className="sm:col-span-2"><label className="text-xs font-semibold text-slate-500 uppercase">Notes</label><p className="text-sm font-medium text-slate-900 mt-1">{clientForm.notes}</p></div>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Case Number</label><p className="text-sm font-medium text-slate-900 mt-1">{caseForm.caseNumber}</p></div>
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Case Title</label><p className="text-sm font-medium text-slate-900 mt-1">{caseForm.caseTitle}</p></div>
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Opposite Party</label><p className="text-sm font-medium text-slate-900 mt-1">{caseForm.oppositeParty}</p></div>
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Filing Date</label><p className="text-sm font-medium text-slate-900 mt-1">{caseForm.filingDate}</p></div>
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase">Assigned Lawyer</label><p className="text-sm font-medium text-slate-900 mt-1">{caseForm.assignedLawyer}</p></div>
                                    <div className="sm:col-span-2"><label className="text-xs font-semibold text-slate-500 uppercase">Description</label><p className="text-sm font-medium text-slate-900 mt-1 p-3 bg-slate-50 rounded border border-slate-100 whitespace-pre-wrap">{caseForm.description}</p></div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowPreview(false)} 
                                className="px-5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Edit Details
                            </button>
                            <button 
                                onClick={previewStep === 1 ? confirmClientSubmit : confirmCaseSubmit}
                                className="px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Confirm & Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
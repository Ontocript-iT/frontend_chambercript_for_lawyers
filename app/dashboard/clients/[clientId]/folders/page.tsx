// app/dashboard/clients/[clientId]/folders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { folderService } from '../../../../../_services/folder/folderService';
import { Folder, Document, FolderContentResponse } from '../../../../../models/folder';
import { Folder as FolderIcon, FileText, ArrowLeft, ChevronRight, FileArchive, ShieldAlert, Upload, X, FolderPlus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ClientFoldersPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = Number(params.clientId);

    const [userId, setUserId] = useState<number>(0);
    const [lawFirmCode, setLawFirmCode] = useState<string>('');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentView, setCurrentView] = useState<FolderContentResponse>({ subFolders: [], documents: [] });
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: number | null; name: string }[]>([
        { id: null, name: 'Root Directory' }
    ]);

    const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadForm, setUploadForm] = useState({ file: null as File | null, documentType: 'General', version: 'v1.0' });

    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [folderError, setFolderError] = useState('');
    const [folderForm, setFolderForm] = useState({ name: '' });

    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameForm, setRenameForm] = useState({ id: 0, name: '' });
    const [activeCaseId, setActiveCaseId] = useState<number | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<{ id: number, name: string } | null>(null);
    const [deleteError, setDeleteError] = useState('');


    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setUserId(parsedUser.id);
            setLawFirmCode(parsedUser.lawFirmCode);
        }
        
        const storedCaseId = localStorage.getItem('activeCaseId');
        if (storedCaseId) {
            setActiveCaseId(Number(storedCaseId));
        }

        fetchFoldersForCurrentView();
    }, [clientId]);

    const fetchFoldersForCurrentView = async (targetFolderId: number | null = currentFolderId) => {
        try {
            setIsLoading(true);
            if (targetFolderId === null) {
                const allFolders = await folderService.getFoldersByClientId(clientId);
                setCurrentView({ subFolders: allFolders.filter((f: any) => !f.parentFolder), documents: [] });
            } else {
                const contents = await folderService.getFolderContents(targetFolderId);
                setCurrentView(contents);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Navigation Handlers
    const handleFolderClick = (folderId: number, folderName: string) => {
        setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
        fetchFoldersForCurrentView(folderId);
    };

    const handleBreadcrumbClick = (targetIndex: number, folderId: number | null) => {
        const newBreadcrumbs = breadcrumbs.slice(0, targetIndex + 1);
        setBreadcrumbs(newBreadcrumbs);
        fetchFoldersForCurrentView(folderId);
    };

    // 3. Document Upload Handler
    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentFolderId) return setUploadError("You must navigate into a specific folder before uploading.");
        if (!uploadForm.file) return setUploadError("Please select a file.");

        setIsUploading(true); setUploadError('');
        try {
            await folderService.uploadDocument({
                file: uploadForm.file, documentType: uploadForm.documentType,
                version: uploadForm.version, uploadedBy: userId,
                folderId: currentFolderId, lawFirmCode: lawFirmCode
            });
            setIsUploadOpen(false);
            setUploadForm({ file: null, documentType: 'General', version: 'v1.0' });
            fetchFoldersForCurrentView();
        } catch (err: any) {
            setUploadError(err.message);
        } finally { setIsUploading(false); }
    };

    // 4. Create Folder Handler
    const handleCreateFolderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!folderForm.name) return setFolderError("Folder Name is required.");

        let targetCaseId = activeCaseId;
        if (currentView.subFolders.length > 0) {
            targetCaseId = currentView.subFolders[0].caseId;
        }

        if (!targetCaseId) {
            return setFolderError("System Error: No active Case ID found. Please go back and select a case.");
        }

        setIsCreatingFolder(true); 
        setFolderError('');
        
        try {
            await folderService.createFolder({
                name: folderForm.name,
                caseId: targetCaseId,
                clientId: clientId,
                parentFolderId: currentFolderId
            });
            
            setIsFolderModalOpen(false);
            setFolderForm({ name: '' });
            fetchFoldersForCurrentView();
        } catch (err: any) {
            setFolderError(err.message);
        } finally { 
            setIsCreatingFolder(false); 
        }
    };

    // 5. Rename Folder Handlers
    const openRenameModal = (folderId: number, currentName: string) => {
        setRenameForm({ id: folderId, name: currentName });
        setIsRenameModalOpen(true);
        setFolderError('');
    };

    const handleRenameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!renameForm.name) return setFolderError("Folder name cannot be empty.");

        setIsRenaming(true); setFolderError('');
        try {
            await folderService.renameFolder(renameForm.id, renameForm.name);
            setIsRenameModalOpen(false);
            fetchFoldersForCurrentView();
        } catch (err: any) {
            setFolderError(err.message);
        } finally { setIsRenaming(false); }
    };

    const handleDeleteFolderClick = (folderId: number, folderName: string) => {
        setFolderToDelete({ id: folderId, name: folderName });
        setDeleteError('');
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteFolder = async () => {
        if (!folderToDelete) return;
        
        setIsDeleting(true);
        setDeleteError('');
        try {
            await folderService.deleteFolder(folderToDelete.id);
            setIsDeleteModalOpen(false);
            setFolderToDelete(null);
            fetchFoldersForCurrentView();
        } catch (err: any) {
            setDeleteError(err.message || 'Failed to delete folder.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 relative p-4 sm:p-6">
            
            {/* Header & Back Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                <div>
                    <button 
                        onClick={() => router.push('/dashboard/clients/view')} 
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Client Directory
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Document Repository</h1>
                    <p className="text-slate-500 mt-1.5 text-sm sm:text-base">Browse folders, pleadings, and evidence for Client</p>
                </div>

                <div className="flex flex-row items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setIsFolderModalOpen(true)} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-50 hover:text-blue-700 hover:border-blue-300 transition-all shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FolderPlus className="w-4.5 h-4.5" /> New Folder
                    </button>

                    {currentFolderId && (
                        <button 
                            onClick={() => setIsUploadOpen(true)} 
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600 transition-all shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            <Upload className="w-4.5 h-4.5" /> Upload File
                        </button>
                    )}
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="bg-slate-50/80 px-5 py-3.5 rounded-xl border border-slate-200 flex items-center overflow-x-auto shadow-inner shadow-slate-100/50 scrollbar-hide">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <div key={crumb.id || 'root'} className="flex items-center flex-shrink-0">
                            <button 
                                onClick={() => !isLast && handleBreadcrumbClick(index, crumb.id)} 
                                className={`text-sm font-medium transition-colors focus:outline-none focus:underline ${isLast ? 'text-slate-900 cursor-default' : 'text-blue-600 hover:text-blue-800'}`}
                            >
                                {crumb.name}
                            </button>
                            {!isLast && <ChevronRight className="w-4 h-4 text-slate-400 mx-2.5" />}
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="bg-slate-50/50 rounded-2xl border border-slate-200 min-h-[450px]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-[450px]">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-[450px] text-center px-4">
                        <div className="p-4 bg-red-50 rounded-full mb-4">
                            <ShieldAlert className="w-10 h-10 text-red-500" />
                        </div>
                        <p className="text-slate-800 font-medium text-lg">{error}</p>
                        <button onClick={() => fetchFoldersForCurrentView()} className="mt-4 text-blue-600 hover:underline font-medium text-sm">Try Again</button>
                    </div>
                ) : currentView.subFolders.length === 0 && currentView.documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[450px] text-center text-slate-500 px-4">
                        <div className="p-6 bg-white border border-slate-100 rounded-full shadow-sm mb-5">
                            <FileArchive className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">This folder is empty</h3>
                        <p className="text-sm mt-1 mb-6 max-w-sm">Get started by creating a new sub-folder or uploading a document directly here.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setIsFolderModalOpen(true)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Create Folder</button>
                            {currentFolderId && <span className="text-slate-300">|</span>}
                            {currentFolderId && <button onClick={() => setIsUploadOpen(true)} className="text-amber-600 hover:text-amber-800 font-medium transition-colors">Upload File</button>}
                        </div>
                    </div>
                ) : (
                    <div className="p-6 sm:p-8">
                        {/* Folders Grid */}
                      {currentView.subFolders.length > 0 && (
                            <div className="mb-10">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Folders</h3>
                                
                                {/* Changed from grid to flex-col space-y-3 for vertical stacking */}
                                <div className="flex flex-col space-y-3">
                                    {currentView.subFolders.map(folder => (
                                        <div key={folder.id} className="flex items-center justify-between p-3 sm:p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group">
                                            
                                            {/* Clickable Area to navigate INTO the folder */}
                                            <button 
                                                onClick={() => handleFolderClick(folder.id, folder.name)} 
                                                className="flex items-center flex-1 min-w-0 text-left outline-none"
                                            >
                                                <FolderIcon className="w-8 h-8 text-blue-500 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" fill="currentColor" fillOpacity={0.15} />
                                                
                                                {/* Removed 'truncate' and added 'break-words' to show the full name */}
                                                <span className="font-medium text-slate-800 group-hover:text-blue-700 break-words pr-4 w-full">
                                                    {folder.name}
                                                </span>
                                            </button>

                                            {/* Actions Area (Edit / Delete) */}
                                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <button 
                                                    onClick={() => openRenameModal(folder.id, folder.name)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    title="Rename Folder"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteFolderClick(folder.id, folder.name)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    title="Delete Folder"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents List */}
                        {currentView.documents.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Files</h3>
                                <div className="space-y-3">
                                    {currentView.documents.map(doc => (
                                        <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all gap-4">
                                            <div className="flex items-center overflow-hidden min-w-0">
                                                <div className="p-2.5 bg-amber-50 rounded-lg mr-4 border border-amber-100/50 flex-shrink-0">
                                                    <FileText className="w-6 h-6 text-amber-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800 truncate">{doc.documentName}</p>
                                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                            Type: {doc.documentType}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                            Version: {doc.version}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link 
                                                href={doc.fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="w-full sm:w-auto text-center px-5 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            >
                                                View Document
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- Create Folder Modal --- */}
            {isFolderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="p-1.5 bg-blue-100 rounded-md text-blue-600"><FolderPlus className="w-5 h-5" /></div>
                                Create New Folder
                            </h3>
                            <button onClick={() => setIsFolderModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateFolderSubmit} className="p-6 space-y-5 overflow-y-auto">
                            {folderError && <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">{folderError}</div>}
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Folder Name</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={folderForm.name} 
                                    onChange={e => setFolderForm({ name: e.target.value })} 
                                    className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                                    placeholder="e.g., 01_Pleadings" 
                                />
                            </div>

                            {/* <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-800 flex items-start gap-2">
                                    <span className="mt-0.5">✓</span>
                                    <span>Case ID is automatically linked from your active workspace session.</span>
                                </p>
                            </div> */}

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsFolderModalOpen(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isCreatingFolder} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                                    {isCreatingFolder ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : null}
                                    {isCreatingFolder ? 'Creating...' : 'Create Folder'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Rename Folder Modal --- */}
            {isRenameModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="p-1.5 bg-blue-100 rounded-md text-blue-600"><Edit className="w-5 h-5" /></div>
                                Rename Folder
                            </h3>
                            <button onClick={() => setIsRenameModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRenameSubmit} className="p-6 space-y-5 overflow-y-auto">
                            {folderError && <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">{folderError}</div>}
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Folder Name</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={renameForm.name} 
                                    onChange={e => setRenameForm({...renameForm, name: e.target.value})} 
                                    className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsRenameModalOpen(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isRenaming} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                                    {isRenaming ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : null}
                                    {isRenaming ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Upload Modal --- */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="p-1.5 bg-amber-100 rounded-md text-amber-600"><Upload className="w-5 h-5" /></div>
                                Upload Document
                            </h3>
                            <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUploadSubmit} className="p-6 space-y-5 overflow-y-auto">
                            {uploadError && <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">{uploadError}</div>}
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select File</label>
                                <input 
                                    required 
                                    type="file" 
                                    onChange={e => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})} 
                                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer" 
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Document Type</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={uploadForm.documentType} 
                                        onChange={e => setUploadForm({...uploadForm, documentType: e.target.value})} 
                                        className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow" 
                                        placeholder="e.g., Plaint, Evidence"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Version</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={uploadForm.version} 
                                        onChange={e => setUploadForm({...uploadForm, version: e.target.value})} 
                                        className="w-full border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow" 
                                        placeholder="e.g., v1.0"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsUploadOpen(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isUploading || !uploadForm.file} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-amber-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1">
                                    {isUploading ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : null}
                                    {isUploading ? 'Uploading...' : 'Upload File'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Delete Folder Modal --- */}
            {isDeleteModalOpen && folderToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="p-1.5 bg-red-100 rounded-md text-red-600"><Trash2 className="w-5 h-5" /></div>
                                Confirm Deletion
                            </h3>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {deleteError && <div className="mb-4 p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">{deleteError}</div>}
                            
                            <p className="text-slate-700 mb-6 leading-relaxed">
                                Are you sure you want to delete the folder <span className="font-bold text-slate-900">"{folderToDelete.name}"</span>? This action cannot be undone.
                            </p>
                            
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDeleteFolder} 
                                    disabled={isDeleting} 
                                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                >
                                    {isDeleting ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : null}
                                    {isDeleting ? 'Deleting...' : 'Delete Folder'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
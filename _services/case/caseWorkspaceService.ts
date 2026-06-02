// services/caseWorkspaceService.ts
import { CaseRegisterRequest, FolderCreateRequest, DocumentUploadRequest } from '../../models/case';


const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
};

export const caseWorkspaceService = {
    // 1. Register Case
    registerCase: async (caseData: CaseRegisterRequest) => {
        const response = await fetch(`${BASE_URL}/cases/register`, {
            method: 'POST',
            headers: { ...getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(caseData),
        });
        if (!response.ok) throw new Error('Failed to register case');
        return response.json(); // Returns { data: { id: ... } }
    },

    // 2. Create Folder (Main or Sub)
    createFolder: async (folderData: FolderCreateRequest) => {
        const response = await fetch(`${BASE_URL}/folders/create`, {
            method: 'POST',
            headers: { ...getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(folderData),
        });
        if (!response.ok) throw new Error('Failed to create folder');
        return response.json(); // Returns { folder: { id: ... } }
    },

    // 3. Upload Document (Multipart/FormData)
    uploadDocument: async (uploadData: DocumentUploadRequest) => {
        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('documentType', uploadData.documentType);
        formData.append('version', uploadData.version);
        formData.append('uploadedBy', uploadData.uploadedBy.toString());
        formData.append('folderId', uploadData.folderId.toString());

        formData.append('lawFirmCode', "LF000001" );

        // console.log("form--",formData.append)

        const response = await fetch(`${BASE_URL}/documents/upload`, {
            method: 'POST',
            // DO NOT set 'Content-Type'. The browser sets it automatically with the boundary for FormData.
            headers: getHeaders(), 
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload document');
        return response.json();
    },

    registerClient: async (clientData: any) => {
        const response = await fetch(`${BASE_URL}/clients/register`, {
            method: 'POST',
            headers: { ...getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.message || 'Failed to register client');
        }
        return response.json(); // Expected: { id: 3, message: "...", status: 201 }
    },

    getCaseById: async (caseId: number): Promise<any> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/cases/getCaseById/${caseId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch case details.');
        const json = await response.json();
        return json.data;
    }

    
};
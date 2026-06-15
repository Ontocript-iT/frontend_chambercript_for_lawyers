
import { CaseRegisterRequest, FolderCreateRequest, DocumentUploadRequest } from '../../models/case';


const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
};

export const caseWorkspaceService = {
    registerCase: async (caseData: CaseRegisterRequest) => {
        const response = await fetch(`${BASE_URL}/cases/register`, {
            method: 'POST',
            headers: { ...getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(caseData),
        });
        if (!response.ok) throw new Error('Failed to register case');
        return response.json(); 
    },
    createFolder: async (folderData: FolderCreateRequest) => {
        const response = await fetch(`${BASE_URL}/folders/create`, {
            method: 'POST',
            headers: { ...getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(folderData),
        });
        if (!response.ok) throw new Error('Failed to create folder');
        return response.json(); 
    },
    uploadDocument: async (uploadData: DocumentUploadRequest) => {
        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('documentType', uploadData.documentType);
        formData.append('version', uploadData.version);
        formData.append('uploadedBy', uploadData.uploadedBy.toString());
        formData.append('folderId', uploadData.folderId.toString());

        formData.append('lawFirmCode', uploadData.lawFirmCode);

        const response = await fetch(`${BASE_URL}/documents/upload`, {
            method: 'POST',
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
        return response.json(); 
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
    },

    updateCase: async (caseId: number, updateData: any) => {
        const response = await fetch(`${BASE_URL}/cases/updateCase/${caseId}`, {
            method: 'PUT',
            headers: { 
                ...getHeaders(), 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(updateData)
        });
        console.log('Update Case Response:', response);

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.message || 'Failed to update case details.');
        }
        return response.json();
    },

    getCaseTypes: async () => {
        const response = await fetch(`${BASE_URL}/cases/getCaseTypes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getHeaders()
            }
        });
        if (!response.ok) throw new Error('Failed to fetch case types');
        return response.json();
    },

    getAllCourts: async () => {
        const response = await fetch(`${BASE_URL}/cases/getAllCourts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getHeaders()
            }
        });
        if (!response.ok) throw new Error('Failed to fetch courts');
        return response.json();
    },
// Fetch cases by status with pagination
    getCasesByStatus: async (lawFirmCode: string, status: string, page: number, size: number) => {
        const response = await fetch(`${BASE_URL}/cases/getCasesByStatus/${lawFirmCode}?status=${status}&page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getHeaders() 
            }
        });
        if (!response.ok) throw new Error(`Failed to fetch ${status} cases`);
        return response.json();
    },

    // Update the status of a specific case
    updateCaseStatus: async (caseId: number, status: string) => {
        const response = await fetch(`${BASE_URL}/cases/updateCaseStatus/${caseId}?status=${status}`, {
            method: 'PUT', // Change to POST or PATCH if required by your Spring Boot controller
            headers: {
                'Content-Type': 'application/json',
                ...getHeaders()
            }
        });
        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.message || 'Failed to update case status');
        }
        return response.json();
    }
    
};
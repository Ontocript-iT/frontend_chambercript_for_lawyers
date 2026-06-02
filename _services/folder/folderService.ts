

const FOLDERS_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/folders`;
const DOCS_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/documents`; // Base URL for documents



export interface FolderCreateRequest {
    name: string;
    caseId: number;
    clientId: number;
    parentFolderId: number | null;
}

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export interface DocumentUploadRequest {
    file: File;
    documentType: string;
    version: string;
    uploadedBy: number;
    folderId: number;
    lawFirmCode: string;
}

export const folderService = {
    getFoldersByClientId: async (clientId: number) => {
        const response = await fetch(`${FOLDERS_URL}/getFolderByClientId/${clientId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch client folders.');
        const data = await response.json();
        return data.folders; 
    },

    getFolderContents: async (folderId: number) => {
        const response = await fetch(`${FOLDERS_URL}/${folderId}/contents`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to load folder contents.');
        const data = await response.json();
        return data.contents; 
    },

    // NEW: Upload Document Method
    uploadDocument: async (uploadData: DocumentUploadRequest) => {
        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('documentType', uploadData.documentType);
        formData.append('version', uploadData.version);
        formData.append('uploadedBy', uploadData.uploadedBy.toString());
        formData.append('folderId', uploadData.folderId.toString());
        formData.append('lawFirmCode', uploadData.lawFirmCode);

        const token = localStorage.getItem('token');
        const response = await fetch(`${DOCS_URL}/upload`, {
            method: 'POST',
            headers: {
                // IMPORTANT: Do NOT set 'Content-Type' here. 
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Failed to upload document.');
        }
        return response.json();
    },
    createFolder: async (folderData: FolderCreateRequest) => {
        const response = await fetch(`${FOLDERS_URL}/create`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(folderData),
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Failed to create folder.');
        }
        return response.json();
    },
    renameFolder: async (folderId: number, newName: string) => {
        const response = await fetch(`${FOLDERS_URL}/renameFolder/${folderId}?newName=${encodeURIComponent(newName)}`, {
            method: 'PUT', // Assuming your backend uses PUT or POST for this update
            headers: getHeaders(),
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Failed to rename folder.');
        }
        return response.json();
    },

    // NEW: Delete Folder Method
    deleteFolder: async (folderId: number) => {
        const response = await fetch(`${FOLDERS_URL}/deleteFolder/${folderId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Failed to delete folder. It may not be empty.');
        }
        
        // Some backends return 204 No Content for DELETE, so we handle empty responses safely
        return response.text().then(text => text ? JSON.parse(text) : {});
    }
};
// models/folder.ts

export interface Document {
    id: number;
    documentName: string;
    documentType: string;
    fileUrl: string;
    uploadedBy: string;
    version: string;
    lawFirmCode: string | null;
}

export interface Folder {
    id: number;
    name: string;
    caseId: number;
    clientId: number;
    lawFirmCode: string | null;
    parentFolder: Folder | null;
    subFolders: Folder[];
    documents: Document[];
}

export interface FolderContentResponse {
    subFolders: Folder[];
    documents: Document[];
}
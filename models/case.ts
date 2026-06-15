// types/case.ts

export interface CaseRegisterRequest {
    caseNumber: string;
    caseTitle: string;
    oppositeParty: string;
    filingDate: string;
    description: string;
    assignedLawyer: string;
    clientId: number;
    caseTypeId: { id: number };
    courtId: { id: number };
    
}

export interface FolderCreateRequest {
    name: string;
    caseId: number;
    clientId: number;
    parentFolderId: number | null;
}

export interface DocumentUploadRequest {
    file: File;
    documentType: string;
    version: string;
    uploadedBy: string;
    folderId: number;
    lawFirmCode: string;
}

export interface CaseDetails {
    id: number;
    caseNumber: string;
    caseTitle: string;
    description: string;
    assignedLawyer: string;
    oppositeParty: string;
    filingDate: string;
    status: string;
    caseType: {
        id: number;
        typeName: string;
        description: string;
    };
    court: {
        id: number;
        courtName: string;
        courtType: string;
        location: string;
    };
}
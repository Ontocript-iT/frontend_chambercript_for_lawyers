// models/superAdmin.ts

export interface SuperAdminSubscription {
    id: number;
    adminId: number;
    adminName: string;
    planType: string;
    maxEmployees: number;
    maxStorageGb: number;
    active: boolean;
    email: string;
}

export interface PaymentRecord {
    id: number;
    lawFirmCode: string;
    paymentYear: number;
    paymentMonth: number;
    isPaid: boolean;
    amountPaid: number;
    paymentDate: string;
    transactionReference: string;
}

export interface RecordPaymentRequest {
    paymentYear: number;
    paymentMonth: number;
    amountPaid: number;
    transactionReference: string;
}


export interface FirmEmployeeAccount {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    nic: string | null;
    role: string;
    lawFirmCode: string | null;
    enabled: boolean;
}

export interface FirmEmployee {
    id: number;
    userAccount: FirmEmployeeAccount;
}

export interface LawFirmAdmin {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    nic: string | null;
    lawFirmCode: string | null;
    role: string;
    enabled: boolean;
    createdEmployees: FirmEmployee[];
}
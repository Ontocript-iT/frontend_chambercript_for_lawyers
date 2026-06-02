// types/client.ts

export interface ClientRegisterRequest {
    name: string;
    nic: string;
    password?: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
}

export interface Client {
    id: number;
    name: string;
    nic: string;
    phone: string;
    email: string;
    lawFirmCode: string;
    address: string;
    notes: string;
    createdAt: string; // ISO date string from backend
}
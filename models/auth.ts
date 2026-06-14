

export interface User {
    role: string;
    id: number;
    email: string;
    lawFirmCode:string
    isPaymentCompleted: boolean;
}

export interface LoginResponse {
    message: string;
    user: User;
    status: number;
    token: string;
    isPaymentCompleted: boolean;
    isSendSms: boolean;
}

export interface RegisterAdminRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    nic: string;
    planType: string;
    smsPlan: string;
}

export interface RegisterEmployeeRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    nic: string;
    adminId: number;
}


export interface UserDetails {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    nic: string;
    phone: string | null;
    lawFirmCode: string | null;
    role: string;
    profilePictureUrl: string | null;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    emailVerified: boolean;
    enabled: boolean;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
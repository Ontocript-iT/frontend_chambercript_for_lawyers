

export interface UserDetails {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    nic: string;
    lawFirmCode: string | null;
    role: string;
    profilePictureUrl: string | null;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    emailVerified: boolean;
    enabled: boolean;
}

export interface UserDetailsResponse {
    data: UserDetails;
    message: string;
    status: number;
}

export interface User {
    role: string;
    id: number;
    email: string;
    lawFirmCode: string; // Ensure this is added
}
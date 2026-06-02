
export interface Employee {
    profilePictureUrl: string | null;
    role: string;
    phone: string | null;
    name: string;
    id: number;
    userId: number;
    email: string;
}

export interface EmployeeResponse {
    data: Employee[];
    message: string;
    status: number;
}
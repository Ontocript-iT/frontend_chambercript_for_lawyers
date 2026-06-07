
export interface Employee {
    profilePictureUrl: string | null;
    role: string;
    phone: string | null;
    name: string;
    id: number;
    userId: number;
    email: string;
    identifyType: string;
    identificationNumber: string;
    image1Url: string | null;
    image2Url: string | null;
}

export interface EmployeeResponse {
    data: Employee[];
    message: string;
    status: number;
}
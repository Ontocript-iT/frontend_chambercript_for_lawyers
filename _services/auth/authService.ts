// services/authService.ts
import { LoginResponse, RegisterAdminRequest } from '../../models/auth';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth`;

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed. Please check your credentials.');
        }

        const data: LoginResponse = await response.json();
        // Best practice: Store token in an HTTP-only cookie or session storage
        if (typeof window !== 'undefined' && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('lawFirmCode', data.user.lawFirmCode);
            localStorage.setItem('isPaymentCompleted', data.user.isPaymentCompleted.toString());
        }

        return data;
    },

    registerAdmin: async (adminData: RegisterAdminRequest): Promise<any> => {
        const response = await fetch(`${BASE_URL}/register/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData),
        });

        if (!response.ok) {
            throw new Error('Registration failed.');
        }

        return response.json();
    }
};
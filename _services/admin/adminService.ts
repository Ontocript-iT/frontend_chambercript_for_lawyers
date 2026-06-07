
import { RegisterEmployeeRequest } from '../../models/auth';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const adminService = {
 registerEmployee: async (employeeData: FormData): Promise<any> => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${BASE_URL}/admin/register-employee`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}` 
        },
        body: employeeData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        throw new Error(
            errorData?.error || 
            errorData?.message || 
            'Failed to register employee.'
        );
    }

    return response.json();
},

    getEmployeesByAdmin: async (adminId: number): Promise<any> => {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${BASE_URL}/admin/get-all-employeesByAdminId/${adminId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to fetch employees.');
        }

        const jsonResponse = await response.json();
        return jsonResponse.data;
    },
    deleteEmployee: async (employeeId: number): Promise<any> => {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${BASE_URL}/admin/delete-employee/${employeeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to delete employee.');
        }
        if (response.headers.get("content-type")?.includes("application/json")) {
            return response.json();
        }
        
        return { success: true };
    },
 getAuditLogs: async (lawFirmCode: string, page: number = 0, size: number = 10): Promise<any> => {
        const token = localStorage.getItem('token');
        
        // Append pagination parameters to the URL
        const response = await fetch(`${BASE_URL}/audit-logs/user/${lawFirmCode}?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to fetch audit logs.');
        }

        // Return the full response object so the component gets .data and .totalItems
        return await response.json(); 
    },

    getEmployeesByAdminId: async (adminId: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/admin/get-all-employeesByAdminId/${adminId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch employees.');
        const jsonResponse = await response.json();
        return jsonResponse.data;
    },
getFutureCases: async (page: number = 0, size: number = 10): Promise<any> => {
        const token = localStorage.getItem('token');
      
        const response = await fetch(`${BASE_URL}/cases/getFutureCases?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Failed to fetch future cases.');
        }

        return await response.json(); 
    }
};

import { RegisterEmployeeRequest } from '../../models/auth';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const adminService = {
    registerEmployee: async (employeeData: RegisterEmployeeRequest): Promise<any> => {
        // Retrieve the JWT token from storage
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${BASE_URL}/admin/register-employee`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to register employee.');
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
    getAuditLogs: async (lawFirmCode: string): Promise<any> => {
        const token = localStorage.getItem('token');
        
        // Use the endpoint provided, passing the dynamic lawFirmCode
        const response = await fetch(`${BASE_URL}/audit-logs/user/${lawFirmCode}`, {
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

        const jsonResponse = await response.json();
        return jsonResponse.data; // Return the array of logs
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
 getFutureCases: async (): Promise<any> => {
    const token = localStorage.getItem('token');
    
    // Ensure you are using your BASE_URL environment variable properly
    const response = await fetch(`${BASE_URL}/cases/getFutureCases`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // This token is required for the API to send data back!
        }
    });

    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Failed to fetch future cases.');
    }

    // Return the full JSON response so we get both .data and .caseCount
    return await response.json(); 
}
};
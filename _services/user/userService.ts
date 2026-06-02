// services/userService.ts

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const userService = {
    getUserDetails: async (userId: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/users/getUserDetailsById/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }
        return response.json();
    },

    changePassword: async (userId: number, currentPassword: string, newPassword: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/auth/change-password/${userId}`, {
            method: 'POST', // Assuming PUT or POST based on standard REST for updates
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json().catch(() => null);

        // If the status is not in the 200 range, throw the custom backend message
        if (!response.ok || (data && data.status >= 400)) {
            throw new Error(data?.message || 'Failed to change password.');
        }

        return data;
    }
};
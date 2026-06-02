
import { ClientRegisterRequest, Client } from '../../models/client';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/clients`;

export const clientService = {
    registerClient: async (clientData: ClientRegisterRequest): Promise<any> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(clientData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to register client.');
        }
        return response.json();
    },

getClientsByLawFirm: async (lawFirmCode: string): Promise<Client[]> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/clients/getClientsByLawFirmCode/${lawFirmCode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch clients for this firm.');
        }
        
        const jsonResponse = await response.json();
        return jsonResponse.data; // Return the array inside the 'data' field
    },
    // Add this inside your existing clientService

    getCaseByClientId: async (clientId: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/cases/getCaseByClientId/${clientId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Failed to fetch case details for this client.');
        }
        
        const jsonResponse = await response.json();
        return jsonResponse.data; // Returning the inner 'data' object
    }
};
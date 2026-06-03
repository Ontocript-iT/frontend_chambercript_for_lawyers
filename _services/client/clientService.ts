
import { ClientRegisterRequest, Client } from '../../models/client';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

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
        const response = await fetch(`${BASE_URL}/clients/getClientsByLawFirmCode/${lawFirmCode}`, {
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
        return jsonResponse.data;
    },

    getCaseByClientId: async (clientId: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/cases/getCaseByClientId/${clientId}`, {
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
        return jsonResponse.data; 
    }
};
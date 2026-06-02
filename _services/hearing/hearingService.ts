// _services/hearing/hearingService.ts

import { AddHearingRequest, Hearing } from '../../models/hearing';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/hearings'`;


const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const hearingService = {
    addHearing: async (caseId: number, data: AddHearingRequest) => {
        const response = await fetch(`${BASE_URL}/case/${caseId}/add`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Failed to schedule hearing.');
        }
        return response.json();
    },

    getHearingsByCase: async (caseId: number): Promise<Hearing[]> => {
        const response = await fetch(`${BASE_URL}/case/${caseId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Failed to fetch hearings.');
        }
        const jsonResponse = await response.json();
        return jsonResponse.data;
    }
};
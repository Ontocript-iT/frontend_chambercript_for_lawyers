// _services/superAdmin/superAdminService.ts
import { SuperAdminSubscription, PaymentRecord, RecordPaymentRequest,LawFirmAdmin } from '../../models/superAdmin';

const SUPER_ADMIN_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/superAdmin`;
const PAYMENTS_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/payments`;

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const superAdminService = {
    // --- Subscriptions ---
    getAllSubscriptions: async (): Promise<SuperAdminSubscription[]> => {
        const response = await fetch(`${SUPER_ADMIN_URL}/subscriptions`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch subscriptions.');
        return (await response.json()).data;
    },

    searchSubscriptions: async (query: string): Promise<SuperAdminSubscription[]> => {
        const response = await fetch(`${SUPER_ADMIN_URL}/searchSubscriptionsByAdminEmailOrNic/${encodeURIComponent(query)}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to search subscriptions.');
        return (await response.json()).data;
    },

    activateSubscription: async (id: number) => {
        const response = await fetch(`${SUPER_ADMIN_URL}/activeSubscriptionById/${id}`, { 
            method: 'POST', // Assuming PUT for activation
            headers: getHeaders() 
        });
        if (!response.ok) throw new Error('Failed to activate subscription.');
        return response.json();
    },

    // --- Payments ---
    getPaymentHistory: async (lawFirmCode: string): Promise<PaymentRecord[]> => {
        // Fallback to history endpoint if your backend provides one for the grid
        const response = await fetch(`${PAYMENTS_URL}/history/${lawFirmCode}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch payment history.');
        return (await response.json()).data;
    },

    checkPaymentStatus: async (lawFirmCode: string, year: number, month: number): Promise<PaymentRecord> => {
        const response = await fetch(`${PAYMENTS_URL}/status/${lawFirmCode}?year=${year}&month=${month}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch payment status.');
        return (await response.json()).data;
    },

    recordPayment: async (lawFirmCode: string, payload: RecordPaymentRequest) => {
        const response = await fetch(`${PAYMENTS_URL}/record/${lawFirmCode}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to record payment.');
        return response.json();
    },

    getAllLawFirms: async (): Promise<LawFirmAdmin[]> => {
        const response = await fetch(`${SUPER_ADMIN_URL}/getAllLawFirms`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch law firms directory.');
        return (await response.json()).data;
    },

    searchLawFirmByCode: async (code: string): Promise<LawFirmAdmin> => {
        const response = await fetch(`${SUPER_ADMIN_URL}/searchLawFirmsByLawFirmCode/${encodeURIComponent(code)}`, {
                     method: 'POST',
            headers: getHeaders(),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Failed to find law firm. Check the code.');
        }
        return (await response.json()).data;
    },
    getInactiveSubscriptions: async (): Promise<SuperAdminSubscription[]> => {
        const response = await fetch(`${SUPER_ADMIN_URL}/getInactiveSubscriptions`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch inactive subscriptions.');
        return (await response.json()).data;
    },
};
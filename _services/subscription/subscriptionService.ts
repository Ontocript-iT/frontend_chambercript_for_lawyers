
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`;


const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export interface UpdatePlanPayload {
    planType: string;
    customMaxEmployees?: number;
    customMaxStorageGb?: number;
}

export const subscriptionService = {
    getCurrentSubscription: async () => {
        const response = await fetch(`${BASE_URL}/current`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (response.status === 404) {
            return null; 
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error(errData?.message || 'Failed to load current subscription.');
        }

        return response.json();
    },


    chooseSubscription: async (payload: UpdatePlanPayload) => {
        const response = await fetch(`${BASE_URL}/choose`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error(errData?.message || 'Failed to create subscription.');
        }

        return response.json();
    },

    updateSubscription: async (payload: UpdatePlanPayload) => {
        const response = await fetch(`${BASE_URL}/update`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error(errData?.message || 'Failed to update subscription.');
        }

        return response.json();
    },
    
    updateSmsPlan: async (smsPlan: string) => {
        const response = await fetch(`${BASE_URL}/updateSmsPlan`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ smsPlan }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error(errData?.message || 'Failed to update SMS plan.');
        }

        return response.json();
    },

    getRemainingSms: async () => {
        const response = await fetch(`${BASE_URL}/remainingSms`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error(errData?.message || 'No remaining SMS count found.');
        }

        return response.json();
    }
};
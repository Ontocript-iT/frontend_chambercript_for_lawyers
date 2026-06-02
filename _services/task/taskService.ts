
import { Task, TaskAssignRequest } from '../../models/task';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const taskService = {
    assignTask: async (data: TaskAssignRequest) => {
        const response = await fetch(`${BASE_URL}/assign`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to assign task.');
        return response.json();
    },

    getTasksByEmployee: async (employeeId: number): Promise<Task[]> => {
        const response = await fetch(`${BASE_URL}/employee/${employeeId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch your tasks.');
        const json = await response.json();
        return json.data || [];
    },

    getTasksByAdmin: async (adminId: number): Promise<Task[]> => {
        const response = await fetch(`${BASE_URL}/admin/${adminId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch delegated tasks.');
        const json = await response.json();
        return json.data || [];
    },

    updateTaskStatus: async (taskId: number, employeeId: number, status: string) => {
        const response = await fetch(`${BASE_URL}/${taskId}/status?employeeId=${employeeId}&status=${status}`, {
            method: 'PUT',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to update task status.');
        return response.json();
    }
};
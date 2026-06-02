
export interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    assignedDate: string;
    assignedToName: string;
    assignedByName: string;
    caseId: number;
    status: string; // PENDING, IN_PROGRESS, COMPLETED
}

export interface TaskAssignRequest {
    title: string;
    description: string;
    dueDate: string;
    assignedToId: number;
    assignedById: number;
    caseId: number;
}
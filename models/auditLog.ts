export interface AuditLog {
    id: number;
    action: string;
    details: string;
    entityId: string;
    entityName: string;
    lawFirmCode: string;
    timestamp: string;
}
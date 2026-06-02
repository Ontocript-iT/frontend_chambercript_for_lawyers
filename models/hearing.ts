// models/hearing.ts

export interface Hearing {
    id: number;
    hearingDate: string;
    hearingType: string;
    notes: string;
    smsReminderEnabled: boolean;
    lawFirmCode: string | null;
    nextDate: string | null;
}

export interface AddHearingRequest {
    hearingDate: string;
    hearingType: string;
    notes: string;
    smsReminderEnabled: boolean;
    lawFirmCode: string;
}
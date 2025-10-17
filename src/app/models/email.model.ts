export interface Email {
  id: number;
  messageId: string;
  subject: string;
  fromEmail: string;
  snippet: string;
  emailDate: string;
  isRead: boolean;
  isSent: boolean;
}

export interface EmailDetail {
  id: number;
  messageId: string;
  subject: string;
  fromEmail: string;
  fromName?: string;
  body: string;
  snippet: string;
  emailDate: string;
  isRead: boolean;
  isSent: boolean;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  newEmails: number;
  updatedEmails: number;
  totalProcessed: number;
  lastSync: string;
}

export interface EmailsResponse {
  success: boolean;
  emails: Email[];
  count: number;
}

export interface SyncStatus {
  success: boolean;
  lastSync?: string;
  emailCount: number;
  hasSynced: boolean;
}

export interface CalendarEvent {
  id: number;
  eventId: string;
  summary: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime?: string;
  isAllDay: boolean;
  attendees?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CalendarSyncResponse {
  success: boolean;
  message: string;
  newEvents: number;
  updatedEvents: number;
  totalProcessed: number;
  lastSync: string;
}

export interface CalendarEventsResponse {
  success: boolean;
  events: CalendarEvent[];
  count: number;
}

export interface CalendarSyncStatus {
  success: boolean;
  lastSync?: string;
  eventCount: number;
  upcomingCount: number;
  hasSynced: boolean;
}

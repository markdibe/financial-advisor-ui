import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CalendarEvent,
  CalendarSyncResponse,
  CalendarEventsResponse,
  CalendarSyncStatus,
} from '../models/calendar.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Sync calendar events from Google Calendar
   */
  syncCalendar(
    userId: number,
    fullSync: boolean = false
  ): Observable<CalendarSyncResponse> {
    return this.http.post<CalendarSyncResponse>(
      `${this.apiUrl}/calendar/sync/${userId}?fullSync=${fullSync}`,
      {}
    );
  }

  /**
   * Get calendar events for a user
   */
  getEvents(
    userId: number,
    limit: number = 20
  ): Observable<CalendarEventsResponse> {
    return this.http.get<CalendarEventsResponse>(
      `${this.apiUrl}/calendar/events/${userId}?limit=${limit}`
    );
  }

  /**
   * Get calendar sync status
   */
  getSyncStatus(userId: number): Observable<CalendarSyncStatus> {
    return this.http.get<CalendarSyncStatus>(
      `${this.apiUrl}/calendar/sync-status/${userId}`
    );
  }
}

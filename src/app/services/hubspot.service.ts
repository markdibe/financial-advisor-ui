import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  HubSpotCompany,
  HubSpotContact,
  HubSpotDeal,
  HubSpotSyncStatus,
} from '../models/hubspot.model';

@Injectable({
  providedIn: 'root',
})
export class HubspotService {
  private apiUrl = `${environment.apiUrl}/hubspot`;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  constructor(private http: HttpClient) {}

  initiateConnection(
    userId: number
  ): Observable<{ authUrl: string; state: string }> {
    return this.http.get<{ authUrl: string; state: string }>(
      `${this.apiUrl}/connect/${userId}`
    );
  }

  handleCallback(
    userId: number,
    code: string,
    state: string
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(`${this.apiUrl}/callback`, {
        userId,
        code,
        state,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.connectedSubject.next(true);
          }
        })
      );
  }

  checkConnectionStatus(
    userId: number
  ): Observable<{ success: boolean; connected: boolean }> {
    return this.http
      .get<{ success: boolean; connected: boolean }>(
        `${this.apiUrl}/status/${userId}`
      )
      .pipe(
        tap((response) => {
          this.connectedSubject.next(response.connected);
        })
      );
  }

  syncHubSpot(
    userId: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/sync/${userId}`,
      {}
    );
  }

  getContacts(
    userId: number,
    limit: number = 50
  ): Observable<{
    success: boolean;
    contacts: HubSpotContact[];
    count: number;
  }> {
    return this.http.get<{
      success: boolean;
      contacts: HubSpotContact[];
      count: number;
    }>(`${this.apiUrl}/contacts/${userId}?limit=${limit}`);
  }

  getCompanies(
    userId: number,
    limit: number = 50
  ): Observable<{
    success: boolean;
    companies: HubSpotCompany[];
    count: number;
  }> {
    return this.http.get<{
      success: boolean;
      companies: HubSpotCompany[];
      count: number;
    }>(`${this.apiUrl}/companies/${userId}?limit=${limit}`);
  }

  getDeals(
    userId: number,
    limit: number = 50
  ): Observable<{ success: boolean; deals: HubSpotDeal[]; count: number }> {
    return this.http.get<{
      success: boolean;
      deals: HubSpotDeal[];
      count: number;
    }>(`${this.apiUrl}/deals/${userId}?limit=${limit}`);
  }

  getSyncStatus(userId: number): Observable<HubSpotSyncStatus> {
    return this.http.get<HubSpotSyncStatus>(
      `${this.apiUrl}/sync-status/${userId}`
    );
  }
}

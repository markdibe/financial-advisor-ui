import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  EmailDetail,
  EmailsResponse,
  SyncResponse,
  SyncStatus,
} from '../models/email.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  syncEmails(
    userId: number,
    maxResults: number = 100
  ): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(
      `${this.apiUrl}/gmail/sync/${userId}?maxResults=${maxResults}`,
      {}
    );
  }

  getEmails(
    userId: number,
    limit: number = 50,
    search?: string
  ): Observable<EmailsResponse> {
    let url = `${this.apiUrl}/gmail/emails/${userId}?limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<EmailsResponse>(url);
  }

  getEmailDetail(
    userId: number,
    emailId: number
  ): Observable<{ success: boolean; email: EmailDetail }> {
    return this.http.get<{ success: boolean; email: EmailDetail }>(
      `${this.apiUrl}/gmail/email/${userId}/${emailId}`
    );
  }

  getSyncStatus(userId: number): Observable<SyncStatus> {
    return this.http.get<SyncStatus>(
      `${this.apiUrl}/gmail/sync-status/${userId}`
    );
  }

  sendEmail(
    userId: number,
    to: string,
    subject: string,
    body: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/gmail/send`, {
      userId,
      to,
      subject,
      body,
    });
  }
}

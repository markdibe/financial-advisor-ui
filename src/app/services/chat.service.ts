import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ChatHistoryResponse, SendMessageResponse } from '../models/chat.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(
    userId: number,
    message: string
  ): Observable<SendMessageResponse> {
    return this.http.post<SendMessageResponse>(`${this.apiUrl}/chat/send`, {
      userId,
      message,
    });
  }

  getChatHistory(
    userId: number,
    limit: number = 50
  ): Observable<ChatHistoryResponse> {
    return this.http.get<ChatHistoryResponse>(
      `${this.apiUrl}/chat/history/${userId}?limit=${limit}`
    );
  }

  clearChatHistory(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/chat/clear/${userId}`);
  }
}

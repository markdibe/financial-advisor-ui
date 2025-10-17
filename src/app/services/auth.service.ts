import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage if exists
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  getGoogleLoginUrl(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/google/login`);
  }

  handleGoogleCallback(code: string, state: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/google/callback`, { code, state })
      .pipe(
        tap((response: any) => {
          if (response.success) {
            const user: User = {
              id: response.userId,
              email: response.email,
              hasGoogleAuth: true,
              hasHubspotAuth: false,
            };
            this.setCurrentUser(user);
          }
        })
      );
  }

  getUser(userId: number): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/auth/user/${userId}`)
      .pipe(tap((user) => this.setCurrentUser(user)));
  }

  logout(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout/${userId}`, {}).pipe(
      tap(() => {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
      })
    );
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}

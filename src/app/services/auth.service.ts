import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, { email, password })
      .pipe(tap(res => this.setToken(res.token)), catchError(this.handleError));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, { email, password })
      .pipe(tap(res => this.setToken(res.token)), catchError(this.handleError));
  }

  logout(): void { localStorage.removeItem('token'); }
  getToken(): string | null { return localStorage.getItem('token'); }
  isLoggedIn(): boolean { return !!this.getToken(); }

  private setToken(token: string) { localStorage.setItem('token', token); }
  private handleError(err: HttpErrorResponse) {
    const msg = (err.error && err.error.error) ? err.error.error : 'Unexpected error';
    return throwError(() => new Error(msg));
  }
}

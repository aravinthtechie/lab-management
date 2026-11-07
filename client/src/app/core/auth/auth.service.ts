import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap, tap, throwError, timer } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import { ThemeService } from '../theme/theme.service';

export interface LoginRequest { username: string; password: string; }
export interface PasswordResetRequest { email: string; }
export interface LoginResponse {
  accessToken: string; role: string; fullName?: string; title?: string; theme?: string;
}

// Demo mode: login with admin / admin123 without a backend.
// Set to false when your Spring Boot API is ready.
const USE_MOCK = true;
const KEYS = ['token', 'role', 'fullName', 'title', 'lastLogin'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private theme = inject(ThemeService);

  readonly isMock = USE_MOCK;

  login(body: LoginRequest, remember = false): Observable<LoginResponse> {
    const request$ = USE_MOCK
      ? this.mockLogin(body)
      : this.http.post<LoginResponse>(`${API_BASE_URL}/api/v1/auth/login`, body);

    return request$.pipe(tap(res => {
      this.clear();
      const store: Storage = remember ? localStorage : sessionStorage;
      store.setItem('token', res.accessToken);
      store.setItem('role', res.role);
      store.setItem('fullName', res.fullName ?? body.username);
      store.setItem('title', res.title ?? '');
      store.setItem('lastLogin', new Date().toISOString());
      if (res.theme) this.theme.set(res.theme);
    }));
  }

  requestPasswordReset(body: PasswordResetRequest): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/api/v1/auth/forgot-password`, body);
  }

  logout() {
    this.clear();
    this.router.navigate(['/login']);
  }

  get token() { return this.read('token'); }
  get role() { return this.read('role') ?? ''; }
  get fullName() { return this.read('fullName') ?? ''; }
  get title() { return this.read('title') ?? ''; }
  get lastLogin(): Date | null {
    const v = this.read('lastLogin');
    return v ? new Date(v) : null;
  }
  get initials() {
    return this.fullName.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }

  isLoggedIn() { return !!this.token; }
  isAdmin() { return this.role === 'ROLE_ADMIN'; }

  private read(key: string) { return localStorage.getItem(key) ?? sessionStorage.getItem(key); }

  // Removes only auth keys, so the chosen theme is kept
  private clear() {
    for (const s of [localStorage, sessionStorage]) KEYS.forEach(k => s.removeItem(k));
  }

  private mockLogin(b: LoginRequest): Observable<LoginResponse> {
    const ok = b.username === 'admin' && b.password === 'admin123';
    return timer(600).pipe(
      switchMap(() => ok
        ? of({ accessToken: 'demo-token', role: 'ROLE_ADMIN', fullName: 'Dr. Priya', title: 'Pathologist' })
        : throwError(() => new HttpErrorResponse({ status: 401 })))
    );
  }
}
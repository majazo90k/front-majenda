import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, AuthState } from '../models';
import { ApiService } from './api.service';

const TOKEN_KEY = 'majenda_token';
const EMAIL_KEY = 'majenda_email';
const NAME_KEY = 'majenda_name';

function getItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(key);
  }
  return null;
}

function setItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(key, value);
  }
}

function removeItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(key);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly state = signal<AuthState>({
    token: getItem(TOKEN_KEY),
    email: getItem(EMAIL_KEY),
    isAuthenticated: !!getItem(TOKEN_KEY),
  });

  readonly token = computed(() => this.state().token);
  readonly email = computed(() => this.state().email);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);

  readonly user = computed(() => {
    const e = this.state().email;
    if (!e) return null;
    return {
      email: e,
      name: getItem(NAME_KEY) || e,
      role: 'admin' as const,
      businessName: getItem(NAME_KEY) || 'Mi Negocio',
    };
  });

  constructor(private api: ApiService) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', request).pipe(
      tap((res) => {
        setItem(TOKEN_KEY, res.token);
        setItem(EMAIL_KEY, res.email);
        setItem(NAME_KEY, res.name);
        this.state.set({ token: res.token, email: res.email, isAuthenticated: true });
      })
    );
  }

  logout(): void {
    removeItem(TOKEN_KEY);
    removeItem(EMAIL_KEY);
    removeItem(NAME_KEY);
    this.state.set({ token: null, email: null, isAuthenticated: false });
  }
}

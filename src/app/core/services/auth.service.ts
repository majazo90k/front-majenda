import { Injectable, signal, computed, OnDestroy, inject } from '@angular/core';
import { Observable, tap, interval, Subscription } from 'rxjs';
import { LoginRequest, LoginResponse, AuthState } from '../models';
import { ApiService } from './api.service';

const TOKEN_KEY = 'majenda_token';
const EMAIL_KEY = 'majenda_email';
const NAME_KEY = 'majenda_name';

function getItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) return localStorage.getItem(key);
  return null;
}
function setItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) localStorage.setItem(key, value);
}
function removeItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) localStorage.removeItem(key);
}

function decodeToken(token: string): { exp: number } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {

  private api = inject(ApiService);
  private expireTimer?: Subscription;

  private readonly state = signal<AuthState>({
    token: getItem(TOKEN_KEY),
    email: getItem(EMAIL_KEY),
    isAuthenticated: !!getItem(TOKEN_KEY),
  });

  readonly token = computed(() => this.state().token);
  readonly email = computed(() => this.state().email);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);

  readonly expiresIn = signal<number | null>(null);
  readonly isExpiringSoon = computed(() => {
    const s = this.expiresIn();
    return s !== null && s > 0 && s <= 300;
  });

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

  constructor() {
    if (this.state().token) this.startExpireTimer();
  }

  ngOnDestroy(): void {
    this.expireTimer?.unsubscribe();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', request).pipe(
      tap((res) => {
        setItem(TOKEN_KEY, res.token);
        setItem(EMAIL_KEY, res.email);
        setItem(NAME_KEY, res.name);
        this.state.set({ token: res.token, email: res.email, isAuthenticated: true });
        this.startExpireTimer();
      })
    );
  }

  logout(): void {
    removeItem(TOKEN_KEY);
    removeItem(EMAIL_KEY);
    removeItem(NAME_KEY);
    this.state.set({ token: null, email: null, isAuthenticated: false });
    this.expiresIn.set(null);
    this.expireTimer?.unsubscribe();
  }

  private startExpireTimer(): void {
    this.expireTimer?.unsubscribe();
    const token = this.state().token;
    if (!token) return;

    const decoded = decodeToken(token);
    if (!decoded?.exp) return;

    const update = () => {
      const remaining = decoded.exp * 1000 - Date.now();
      this.expiresIn.set(Math.max(0, Math.floor(remaining / 1000)));
    };

    update();
    this.expireTimer = interval(1000).subscribe(update);
  }
}

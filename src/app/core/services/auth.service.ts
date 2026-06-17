import { Injectable, signal, computed, NgZone, inject } from '@angular/core';
import { Observable, of, throwError, fromEvent, Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, AuthState } from '../models';

const SESSION_DURATION = 10 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly state = signal<AuthState>({ user: null, token: null, isAuthenticated: false });
  private ngZone = inject(NgZone);
  private activitySub: Subscription | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly user = computed(() => this.state().user);
  readonly token = computed(() => this.state().token);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);

  login(request: LoginRequest): Observable<LoginResponse> {
    if (request.email === 'admin@test.com' && request.password === '123456') {
      const response: LoginResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          email: request.email,
          name: 'Admin',
          role: 'admin',
          businessName: 'Mi Negocio',
        },
      };
      return of(response).pipe(
        delay(600),
        tap((res) => {
          this.state.set({ user: res.user, token: res.token, isAuthenticated: true });
          this.startSessionTimer();
        })
      );
    }
    return throwError(() => new Error('Credenciales inválidas'));
  }

  logout(): void {
    this.stopSessionTimer();
    this.state.set({ user: null, token: null, isAuthenticated: false });
  }

  private startSessionTimer(): void {
    this.ngZone.runOutsideAngular(() => {
      this.activitySub = fromEvent(document, 'mousemove click keydown touchstart scroll').subscribe(() => {
        this.resetTimer();
      });
      this.resetTimer();
    });
  }

  private resetTimer(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.ngZone.run(() => this.logout());
    }, SESSION_DURATION);
  }

  private stopSessionTimer(): void {
    if (this.timeoutId) { clearTimeout(this.timeoutId); this.timeoutId = null; }
    this.activitySub?.unsubscribe();
    this.activitySub = null;
  }
}

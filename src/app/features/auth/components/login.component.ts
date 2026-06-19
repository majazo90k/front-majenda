import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div *ngIf="!loading; else loadingScreen" class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Iniciar Sesión</mat-card-title>
          <mat-card-subtitle>Accede al panel administrativo de tu negocio</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width form-field">
              <mat-label>Correo electrónico</mat-label>
              <input matInput type="email" formControlName="email" placeholder="correo@ejemplo.cl" autocomplete="email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('required')">El correo es obligatorio</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Correo electrónico inválido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width form-field">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Ingresa tu contraseña" autocomplete="current-password">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="form.get('password')?.hasError('required')">La contraseña es obligatoria</mat-error>
            </mat-form-field>

            <div class="error-message" *ngIf="error">
              <mat-icon class="error-icon">error_outline</mat-icon>
              {{ error }}
            </div>

            <button mat-raised-button color="primary" type="submit" class="full-width submit-btn">
              Ingresar
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>

    <ng-template #loadingScreen>
      <div class="loading-screen">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Cargando panel...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .login-container {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }
    .login-card { max-width: 420px; width: 100%; padding: 1.5rem; }
    .login-card mat-card-header { display: flex; flex-direction: column; text-align: center; padding-bottom: 1.5rem; }
    .login-card mat-card-title { font-size: 1.4rem; font-weight: 700; }
    .login-card mat-card-subtitle { margin-top: 0.25rem; }
    .full-width { width: 100%; }
    .form-field { margin-bottom: 1.25rem; }
    .submit-btn { padding: 0.6rem; font-size: 1rem; margin-top: 0.5rem; }
    .error-message {
      display: flex; align-items: center; gap: 0.4rem;
      color: #dc2626; font-size: 0.875rem;
      margin-bottom: 0.75rem; padding: 0.5rem 0.75rem;
      background: #fef2f2; border-radius: 8px;
      border: 1px solid #fecaca;
    }
    .error-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .loading-screen {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100vh; gap: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; font-size: 1.1rem;
    }
    @media (max-width: 600px) {
      .login-container { padding: 0.5rem; }
      .login-card { padding: 1rem; }
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = false;
  error = '';

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/agendaclientes/dashboard']),
      error: (err) => {
        if (err.status === 0 || err.statusText === 'Unknown Error') {
          this.error = 'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.';
        } else if (err.status === 401) {
          this.error = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else if (err.status >= 500) {
          this.error = 'Error interno del servidor. Intenta más tarde.';
        } else {
          this.error = err.error?.message || 'Ocurrió un error inesperado. Intenta nuevamente.';
        }
        this.loading = false;
      },
    });
  }
}

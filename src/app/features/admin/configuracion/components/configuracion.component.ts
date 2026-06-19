import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../../../core/services/config.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    NgIf, NgFor, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="config">
      <header><h1>Configuración</h1></header>

      <app-loading-spinner [loading]="loading()" text="Cargando configuración..."></app-loading-spinner>

      <mat-card *ngIf="!loading()">
        <mat-card-header><mat-card-title>Información del negocio</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form">
            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre del negocio</mat-label>
                <input matInput formControlName="businessName" placeholder="Mi Negocio">
              </mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dirección</mat-label>
                <input matInput formControlName="businessAddress" placeholder="Dirección">
              </mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="businessPhone" placeholder="+56912345678">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="businessEmail" placeholder="contacto@mail.cl">
              </mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Duración del slot</mat-label>
                <mat-select formControlName="slotDurationMinutes">
                  <mat-option *ngFor="let d of [15,30,45,60]" [value]="d">{{ d }} min</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Antelación máxima</mat-label>
                <mat-select formControlName="daysAdvanceBooking">
                  <mat-option *ngFor="let d of [7,14,21,30,60,90]" [value]="d">{{ d }} días</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </form>

          <div class="config-actions">
            <button mat-raised-button color="primary" (click)="save()">Guardar cambios</button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="!loading()" class="second-card">
        <mat-card-header><mat-card-title>Horarios del Equipo</mat-card-title></mat-card-header>
        <mat-card-content>
          <p class="hint">Los horarios se configuran directamente en la tarjeta de cada profesional, sección <strong>Equipo</strong>.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .config { padding: 0 1.5rem; }
    .config header h1 { margin: 0 0 1.5rem; }
    .hint { color: #6b7280; font-size: 0.875rem; margin: 0; padding: 1rem 0; }
    .row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .row mat-form-field { flex: 1; min-width: 200px; }
    .full-width { min-width: 100%; }
    .second-card { margin-top: 1rem; }
    .config-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
    @media (max-width: 600px) {
      .config { padding: 0 1rem; }
      .row { flex-direction: column; gap: 0; }
      .row mat-form-field { min-width: 100%; }
      .config-actions button { width: 100%; }
    }
  `],
})
export class ConfiguracionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configService = inject(ConfigService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);

  form = this.fb.nonNullable.group({
    businessName: [''],
    businessAddress: [''],
    businessPhone: [''],
    businessEmail: [''],
    slotDurationMinutes: [30],
    daysAdvanceBooking: [30],
  });

  ngOnInit(): void {
    this.configService.getConfig().subscribe({
      next: (cfg: any) => {
        this.form.patchValue({
          businessName: cfg.businessName || '',
          businessAddress: cfg.businessAddress || '',
          businessPhone: cfg.businessPhone || '',
          businessEmail: cfg.businessEmail || '',
          slotDurationMinutes: cfg.slotDurationMinutes || 30,
          daysAdvanceBooking: cfg.daysAdvanceBooking || 30,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  save(): void {
    this.configService.updateConfig(this.form.getRawValue()).subscribe(() => {
      this.snackBar.open('Configuración guardada', 'Cerrar', { duration: 3000 });
    });
  }
}

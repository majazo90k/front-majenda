import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../../../core/services/config.service';
import { WeekSchedule, DaySchedule } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner.component';

const DAY_NAMES: Record<number, string> = {
  0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
  4: 'Jueves', 5: 'Viernes', 6: 'Sábado',
};

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    NgFor, NgIf, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSlideToggleModule, MatButtonModule, MatDividerModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="config">
      <header>
        <h1>Configuración</h1>
      </header>

      <app-loading-spinner [loading]="loading()" text="Cargando configuración..."></app-loading-spinner>

      <mat-card *ngIf="!loading()">
        <mat-card-header>
          <mat-card-title>Horarios de atención</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="scheduleForm">
            <div *ngFor="let day of dayKeys" class="day-row">
              <mat-slide-toggle
                [formControlName]="'day_' + day + '_active'"
                (change)="onToggleDay(day)"
              >
                {{ DAY_LABELS[day] }}
              </mat-slide-toggle>

              <div class="time-inputs" *ngIf="scheduleForm.get('day_' + day + '_active')?.value">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Apertura</mat-label>
                  <input matInput type="time" [formControlName]="'day_' + day + '_open'">
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Cierre</mat-label>
                  <input matInput type="time" [formControlName]="'day_' + day + '_close'">
                </mat-form-field>
              </div>
            </div>
          </form>

          <div class="config-actions">
            <button mat-raised-button color="primary" (click)="saveSchedule()" [disabled]="scheduleForm.invalid">
              Guardar horarios
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="!loading()" class="second-card">
        <mat-card-header>
          <mat-card-title>Ajustes generales</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="settingsForm">
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Duración de slot (min)</mat-label>
                <input matInput type="number" formControlName="defaultSlotDuration">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Buffer entre turnos (min)</mat-label>
                <input matInput type="number" formControlName="bufferBetweenSlots">
              </mat-form-field>
            </div>
          </form>

          <div class="config-actions">
            <button mat-raised-button color="primary" (click)="saveSettings()" [disabled]="settingsForm.invalid">
              Guardar ajustes
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .config header h1 { margin: 0 0 1.5rem; }
    .day-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .time-inputs {
      display: flex;
      gap: 0.5rem;
      margin-left: auto;
    }
    .config-actions {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }
    .second-card { margin-top: 1rem; }
    .row {
      display: flex;
      gap: 1rem;
    }

    @media (max-width: 600px) {
      .day-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .time-inputs { margin-left: 0; width: 100%; }
      .time-inputs mat-form-field { flex: 1; }
      .row { flex-direction: column; gap: 0; }
      .config-actions button { width: 100%; }
    }
  `],
})
export class ConfiguracionComponent implements OnInit {
  private fb!: FormBuilder;
  private configService!: ConfigService;
  private snackBar!: MatSnackBar;

  loading = signal(true);
  readonly DAY_LABELS = DAY_NAMES;
  readonly dayKeys = [0, 1, 2, 3, 4, 5, 6];

  scheduleForm: any;
  settingsForm: any;

  private currentSchedule: WeekSchedule = {};

  constructor() {
    this.fb = inject(FormBuilder);
    this.configService = inject(ConfigService);
    this.snackBar = inject(MatSnackBar);
    this.scheduleForm = this.fb.nonNullable.group({});
    this.settingsForm = this.fb.nonNullable.group({
      defaultSlotDuration: [30, [Validators.required, Validators.min(5)]],
      bufferBetweenSlots: [5, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.configService.getConfig().subscribe((cfg) => {
      this.currentSchedule = cfg.schedule;
      this.buildScheduleForm(cfg.schedule);
      this.settingsForm.patchValue({
        defaultSlotDuration: cfg.defaultSlotDuration,
        bufferBetweenSlots: cfg.bufferBetweenSlots,
      });
      this.loading.set(false);
    });
  }

  private buildScheduleForm(schedule: WeekSchedule): void {
    const group: Record<string, unknown> = {};
    for (const day of this.dayKeys) {
      const d = schedule[day] || { isWorkingDay: false, openTime: '09:00', closeTime: '18:00' };
      group[`day_${day}_active`] = [d.isWorkingDay];
      group[`day_${day}_open`] = [d.openTime];
      group[`day_${day}_close`] = [d.closeTime];
    }
    this.scheduleForm = this.fb.nonNullable.group(group);
  }

  onToggleDay(day: number): void {
    const active = this.scheduleForm.get(`day_${day}_active`)?.value;
    if (!active) {
      this.scheduleForm.patchValue({
        [`day_${day}_open`]: '09:00',
        [`day_${day}_close`]: '18:00',
      });
    }
  }

  saveSchedule(): void {
    const schedule: WeekSchedule = {};
    for (const day of this.dayKeys) {
      schedule[day] = {
        isWorkingDay: this.scheduleForm.get(`day_${day}_active`)?.value ?? false,
        openTime: this.scheduleForm.get(`day_${day}_open`)?.value ?? '09:00',
        closeTime: this.scheduleForm.get(`day_${day}_close`)?.value ?? '18:00',
      };
    }
    this.configService.updateSchedule(schedule).subscribe(() => {
      this.snackBar.open('Horarios guardados', 'Cerrar', { duration: 3000 });
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) return;
    this.configService.updateGeneralSettings(this.settingsForm.getRawValue()).subscribe(() => {
      this.snackBar.open('Ajustes guardados', 'Cerrar', { duration: 3000 });
    });
  }
}

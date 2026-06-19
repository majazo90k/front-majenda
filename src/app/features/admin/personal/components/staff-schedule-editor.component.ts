import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StaffService } from '../../../../core/services/staff.service';
import { Staff } from '../../../../core/models';

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
};
const DAY_KEYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export interface ScheduleData {
  [day: string]: { active: boolean; open: string; close: string };
}

@Component({
  selector: 'app-staff-schedule-editor',
  standalone: true,
  imports: [
    NgIf, NgFor, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatSlideToggleModule,
  ],
  template: `
    <div class="schedule-dialog">
      <h2>Horario de {{ staff.name }}</h2>
      <p class="subtitle">Configura los días y horas que trabalaja este profesional.</p>

      <form [formGroup]="form">
        <div class="day-list">
        <div *ngFor="let day of DAY_KEYS; let i = index" class="day-row">
          <mat-slide-toggle [formControlName]="day + '_active'">
            {{ DAY_LABELS[day] }}
          </mat-slide-toggle>

          <div class="time-selects" *ngIf="form.get(day + '_active')?.value">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Entrada</mat-label>
              <mat-select [formControlName]="day + '_open'">
                <mat-option *ngFor="let t of TIME_OPTIONS" [value]="t">{{ t }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Salida</mat-label>
              <mat-select [formControlName]="day + '_close'">
                <mat-option *ngFor="let t of TIME_OPTIONS" [value]="t">{{ t }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
        </div>
      </form>

      <div class="actions">
        <button mat-stroked-button (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" (click)="save()">Guardar horario</button>
      </div>
    </div>
  `,
  styles: [`
    .schedule-dialog { padding: 1.5rem; min-width: 420px; }
    .schedule-dialog h2 { margin: 0 0 0.25rem; padding-right: 1rem; }
    .subtitle { color: #6b7280; font-size: 0.875rem; margin: 0 0 1.25rem; }
    .day-list { max-height: 400px; overflow-y: auto; }
    .day-row { display: flex; align-items: center; gap: 1rem; padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; }
    .time-selects { display: flex; gap: 0.5rem; margin-left: auto; }
    .time-selects mat-form-field { width: 130px; }
    .actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
    @media (min-width: 1200px) {
      .time-selects mat-form-field { width: 150px; }
      .schedule-dialog { min-width: 520px; }
    }
    @media (max-width: 600px) {
      .schedule-dialog { min-width: unset; padding: 1rem; }
      .day-list { max-height: 300px; }
      .day-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .time-selects { margin-left: 0; width: 100%; }
      .time-selects mat-form-field { flex: 1; width: auto; }
      .actions { position: sticky; bottom: 0; background: white; padding-top: 0.75rem; }
      .actions button { width: 100%; }
    }
  `],
})
export class StaffScheduleEditorComponent {
  private fb = inject(FormBuilder);
  private staffService = inject(StaffService);
  private snackBar = inject(MatSnackBar);

  readonly TIME_OPTIONS = TIME_OPTIONS;
  readonly DAY_LABELS = DAY_LABELS;
  readonly DAY_KEYS = DAY_KEYS;

  form = this.fb.nonNullable.group({});

  constructor(
    @Inject(MAT_DIALOG_DATA) public staff: Staff,
    public dialogRef: MatDialogRef<StaffScheduleEditorComponent>,
  ) {
    this.buildForm();
  }

  private buildForm(): void {
    const schedule = this.staff.schedule || {};
    const hasAny = DAY_KEYS.some((d) => schedule[d]?.length > 0);
    const group: Record<string, any> = {};
    for (const day of DAY_KEYS) {
      const daySlots = schedule[day];
      const hasSchedule = daySlots && daySlots.length > 0;
      const defaultActive = hasAny ? hasSchedule : (day !== 'SATURDAY' && day !== 'SUNDAY');
      group[day + '_active'] = [defaultActive];
      group[day + '_open'] = [hasSchedule ? daySlots[0].start : '09:00'];
      group[day + '_close'] = [hasSchedule ? daySlots[0].end : '18:00'];
    }
    this.form = this.fb.nonNullable.group(group);
  }

  save(): void {
    const raw = this.form.getRawValue() as Record<string, any>;
    const schedule: Record<string, { open: string; close: string }[]> = {};

    for (const day of DAY_KEYS) {
      if (!raw[day + '_active']) continue;
      schedule[day] = [{ open: raw[day + '_open'], close: raw[day + '_close'] }];
    }

    this.staffService.updateSchedule(this.staff.id, schedule).subscribe({
      next: () => {
        this.snackBar.open('Horario guardado', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error al guardar horario', 'Cerrar', { duration: 3000 });
      },
    });
  }
}

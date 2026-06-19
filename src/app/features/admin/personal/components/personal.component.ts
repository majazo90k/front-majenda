import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StaffService } from '../../../../core/services/staff.service';
import { Staff } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state.component';
import { PersonalFormComponent } from './personal-form.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';
import { StaffScheduleEditorComponent } from './staff-schedule-editor.component';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [
    NgFor, NgIf,
    MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule,
    LoadingSpinnerComponent, EmptyStateComponent, PersonalFormComponent, StaffScheduleEditorComponent,
  ],
  template: `
    <div class="personal">
      <header class="personal-header">
        <h1>Personal</h1>
        <button mat-raised-button color="primary" (click)="showForm.set(true)">
          <mat-icon>add</mat-icon> Agregar profesional
        </button>
      </header>

      <app-loading-spinner [loading]="loading()" text="Cargando personal..."></app-loading-spinner>

      <app-empty-state
        *ngIf="!loading() && staffList().length === 0"
        icon="people"
        title="Sin personal"
        message="Agrega los profesionales de tu negocio."
      ></app-empty-state>

      <app-personal-form
        *ngIf="showForm()"
        (saved)="onSaved($event)"
        (cancelled)="cancelForm()"
      ></app-personal-form>

      <div class="staff-grid" *ngIf="!showForm() && staffList().length > 0">
        <mat-card *ngFor="let s of staffList()" class="staff-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>person</mat-icon>
            <mat-card-title>{{ s.name }}</mat-card-title>
            <mat-card-subtitle>{{ s.role }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="info-line"><strong>Email:</strong> {{ s.email }}</p>
            <p class="info-line"><strong>Teléfono:</strong> {{ s.phone }}</p>
            <p class="info-line">
              <span class="status-badge" [class.active]="s.active" [class.inactive]="!s.active">
                {{ s.active ? 'Activo' : 'Inactivo' }}
              </span>
            </p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-icon-button color="primary" *ngIf="s.active" (click)="editSchedule(s)" matTooltip="Horario"><mat-icon>schedule</mat-icon></button>
            <button mat-icon-button color="primary" *ngIf="!s.active" (click)="activateStaff(s)" matTooltip="Activar"><mat-icon>person_add</mat-icon></button>
            <button mat-icon-button color="warn" *ngIf="s.active" (click)="deactivateStaff(s)" matTooltip="Desactivar"><mat-icon>block</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteStaff(s)" matTooltip="Eliminar"><mat-icon>delete</mat-icon></button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .personal { padding: 0 1.5rem; }
    .personal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .personal-header h1 { margin: 0; }
    .staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .info-line { margin: 0.25rem 0; font-size: 0.875rem; }
    .status-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.active { background: #d1fae5; color: #065f46; }
    .status-badge.inactive { background: #fee2e2; color: #991b1b; }
    @media (max-width: 600px) {
      .personal { padding: 0 1rem; }
      .personal-header { flex-direction: column; gap: 0.75rem; align-items: stretch; }
      .personal-header h1 { text-align: center; }
      .personal-header button { width: 100%; }
      .staff-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class PersonalComponent implements OnInit {
  private staffService = inject(StaffService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  staffList = signal<Staff[]>([]);
  loading = signal(true);
  showForm = signal(false);

  ngOnInit(): void {
    this.loadStaff();
  }

  private loadStaff(): void {
    this.staffService.getAll().subscribe((s) => {
      this.staffList.set(s);
      this.loading.set(false);
    });
  }

  cancelForm(): void {
    this.showForm.set(false);
  }

  onSaved(_staff: Staff): void {
    this.cancelForm();
    this.snackBar.open('Profesional creado correctamente', 'Cerrar', { duration: 3000 });
    this.loading.set(true);
    this.loadStaff();
  }

  editSchedule(staff: Staff): void {
    this.dialog.open(StaffScheduleEditorComponent, {
      data: staff,
      width: '500px',
    }).afterClosed().subscribe((changed) => {
      if (changed) this.loadStaff();
    });
  }

  activateStaff(staff: Staff): void {
    this.staffService.activate(staff.id).subscribe(() => {
      this.snackBar.open('Profesional activado', 'Cerrar', { duration: 3000 });
      this.loadStaff();
    });
  }

  deactivateStaff(staff: Staff): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar profesional',
        message: `¿Estás seguro de desactivar a "${staff.name}"?`,
        confirmText: 'Desactivar',
        cancelText: 'Cancelar',
      },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.staffService.deactivate(staff.id).subscribe(() => {
        this.snackBar.open('Profesional desactivado', 'Cerrar', { duration: 3000 });
        this.loadStaff();
      });
    });
  }

  deleteStaff(staff: Staff): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar profesional',
        message: `¿Estás seguro de eliminar a "${staff.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.staffService.delete(staff.id).subscribe(() => {
        this.snackBar.open('Profesional eliminado', 'Cerrar', { duration: 3000 });
        this.loadStaff();
      });
    });
  }
}

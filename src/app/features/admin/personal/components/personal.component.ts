import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { StaffService } from '../../../../core/services/staff.service';
import { Staff } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state.component';
import { PersonalFormComponent } from './personal-form.component';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [
    NgFor, NgIf,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    LoadingSpinnerComponent, EmptyStateComponent, PersonalFormComponent,
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
        [staff]="editingStaff()"
        (saved)="onSaved($event)"
        (cancelled)="cancelForm()"
      ></app-personal-form>

      <div class="staff-grid" *ngIf="!showForm() && staffList().length > 0">
        <mat-card *ngFor="let s of staffList()" class="staff-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>person</mat-icon>
            <mat-card-title>{{ s.name }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="section-label">Servicios:</p>
            <div class="chip-group">
              <mat-chip *ngFor="let svc of s.services">{{ getServiceName(svc) }}</mat-chip>
            </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-icon-button color="primary" (click)="editStaff(s)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteStaff(s.id)"><mat-icon>delete</mat-icon></button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .personal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .personal-header h1 { margin: 0; }
    .staff-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    .section-label { font-weight: 500; font-size: 0.875rem; margin: 0.5rem 0 0.25rem; }
    .chip-group { display: flex; flex-wrap: wrap; gap: 0.35rem; }

    @media (max-width: 600px) {
      .personal-header { flex-direction: column; gap: 0.75rem; align-items: stretch; }
      .personal-header h1 { text-align: center; }
      .personal-header button { width: 100%; }
      .staff-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class PersonalComponent implements OnInit {
  private staffService!: StaffService;

  staffList = signal<Staff[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingStaff = signal<Staff | undefined>(undefined);

  private readonly serviceNames: Record<string, string> = {
    'srv-1': 'Corte de cabello',
    'srv-2': 'Corte + Barba',
    'srv-3': 'Barba',
    'srv-4': 'Corte infantil',
  };

  constructor() {
    this.staffService = inject(StaffService);
  }

  ngOnInit(): void {
    this.loadStaff();
  }

  private loadStaff(): void {
    this.staffService.getAll().subscribe((s) => {
      this.staffList.set(s);
      this.loading.set(false);
    });
  }

  getServiceName(id: string): string {
    return this.serviceNames[id] || id;
  }

  editStaff(staff: Staff): void {
    this.editingStaff.set(staff);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingStaff.set(undefined);
  }

  onSaved(_staff: Staff): void {
    this.cancelForm();
    this.loading.set(true);
    this.loadStaff();
  }

  deleteStaff(id: string): void {
    if (confirm('¿Eliminar este profesional?')) {
      this.staffService.delete(id).subscribe(() => this.loadStaff());
    }
  }
}

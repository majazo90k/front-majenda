import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { StaffService } from '../../../../core/services/staff.service';
import { ServiceService } from '../../../../core/services/service.service';
import { Staff } from '../../../../core/models';

@Component({
  selector: 'app-personal-form',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <mat-card class="form-card">
      <mat-card-header>
        <mat-card-title>{{ staff ? 'Editar' : 'Nuevo' }} profesional</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="name" placeholder="Nombre del profesional">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Servicios que realiza</mat-label>
            <mat-select formControlName="services" multiple>
              <mat-option *ngFor="let s of allServices" [value]="s.id">{{ s.name }}</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="cancelled.emit()">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ staff ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-card { max-width: 500px; margin-bottom: 1.5rem; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }

    @media (max-width: 600px) {
      .form-actions { flex-direction: column-reverse; }
      .form-actions button { width: 100%; }
    }
  `],
})
export class PersonalFormComponent implements OnInit {
  private fb!: FormBuilder;
  private staffService!: StaffService;
  private serviceService!: ServiceService;

  @Input() staff?: Staff;
  @Output() saved = new EventEmitter<Staff>();
  @Output() cancelled = new EventEmitter<void>();

  allServices: { id: string; name: string }[] = [];

  form: any;

  constructor() {
    this.fb = inject(FormBuilder);
    this.staffService = inject(StaffService);
    this.serviceService = inject(ServiceService);
    this.form = this.fb.nonNullable.group({
      name: ['', Validators.required],
      services: [[] as string[]],
    });
  }

  ngOnInit(): void {
    this.serviceService.getAll().subscribe((s) => {
      this.allServices = s.filter((svc) => svc.isActive);
    });
    if (this.staff) {
      this.form.patchValue({
        name: this.staff.name,
        services: this.staff.services,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const data = this.form.getRawValue();

    const obs = this.staff
      ? this.staffService.update(this.staff.id, { name: data.name, services: data.services })
      : this.staffService.create({
          name: data.name,
          services: data.services,
          schedule: {
            0: { isWorkingDay: false, openTime: '00:00', closeTime: '00:00' },
            1: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
            2: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
            3: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
            4: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
            5: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
            6: { isWorkingDay: false, openTime: '00:00', closeTime: '00:00' },
          },
        });

    obs.subscribe((result) => {
      if (result) this.saved.emit(result as Staff);
    });
  }
}

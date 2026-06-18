import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { StaffService } from '../../../../core/services/staff.service';
import { Staff, CreateStaffRequest } from '../../../../core/models';

@Component({
  selector: 'app-personal-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <mat-card class="form-card">
      <mat-card-header>
        <mat-card-title>Nuevo profesional</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="name" placeholder="Nombre del profesional">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="email@correo.cl">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="phone" placeholder="+56912345678">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rol</mat-label>
            <input matInput formControlName="role" placeholder="Estilista, Barbero, etc.">
          </mat-form-field>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="cancelled.emit()">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Crear</button>
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
export class PersonalFormComponent {
  private fb = inject(FormBuilder);
  private staffService = inject(StaffService);

  @Output() saved = new EventEmitter<Staff>();
  @Output() cancelled = new EventEmitter<void>();

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    role: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const data = this.form.getRawValue();

    const request: CreateStaffRequest = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    };

    this.staffService.create(request).subscribe((result) => {
      this.saved.emit(result);
    });
  }
}

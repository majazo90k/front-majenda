import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { PhoneInputComponent } from '../../../shared/components/phone-input.component';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, PhoneInputComponent],
  template: `
    <div class="form-wrap">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre completo</mat-label>
          <input matInput formControlName="name" placeholder="Ej: Juan Pérez">
          <mat-error *ngIf="form.get('name')?.hasError('required')">El nombre es requerido</mat-error>
        </mat-form-field>

        <app-phone-input (phoneChange)="onPhoneChange($event)"></app-phone-input>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Correo electrónico</mat-label>
          <input matInput formControlName="email" placeholder="ejemplo@correo.cl" type="email">
          <mat-error *ngIf="form.get('email')?.hasError('required')">El correo es requerido</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">Correo inválido</mat-error>
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit" class="w-full submit-btn" [disabled]="form.invalid || !phoneValue">
          Ir a confirmar
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-wrap { max-width: 440px; margin: 0 auto; }
    .w-full { width: 100%; margin-bottom: 0.25rem; }
    .submit-btn { margin-top: 0.5rem; padding: 0.5rem; font-size: 1rem; }

    @media (max-width: 600px) {
      .form-wrap { max-width: 100%; }
    }
  `],
})
export class BookingFormComponent {
  private fb!: FormBuilder;
  @Output() submitted = new EventEmitter<{ name: string; phone: string; email: string }>();

  phoneValue = '';
  form: any;

  constructor() {
    this.fb = inject(FormBuilder);
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onPhoneChange(fullNumber: string): void {
    this.phoneValue = fullNumber;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.phoneValue) return;
    this.submitted.emit({
      name: this.form.getRawValue().name,
      phone: this.phoneValue,
      email: this.form.getRawValue().email,
    });
  }
}

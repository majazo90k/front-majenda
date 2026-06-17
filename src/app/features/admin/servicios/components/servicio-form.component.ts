import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ServiceService } from '../../../../core/services/service.service';
import { ServiceModel, ServiceCategory } from '../../../../core/models';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <mat-card class="form-card">
      <mat-card-header>
        <mat-card-title>{{ service ? 'Editar' : 'Nuevo' }} servicio</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="name" placeholder="Corte de cabello">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descripción</mat-label>
            <textarea matInput formControlName="description" rows="2"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="category">
              <mat-option value="corte">Corte</mat-option>
              <mat-option value="tintura">Tintura</mat-option>
              <mat-option value="promocion">Promoción</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Duración (min)</mat-label>
              <input matInput type="number" formControlName="duration">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Precio ($)</mat-label>
              <input matInput type="number" formControlName="price">
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="cancelled.emit()">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ service ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-card { max-width: 500px; margin-bottom: 1.5rem; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 1rem; }
    .form-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }

    @media (max-width: 600px) {
      .row { flex-direction: column; gap: 0; }
      .form-actions { flex-direction: column-reverse; }
      .form-actions button { width: 100%; }
    }
  `],
})
export class ServicioFormComponent implements OnInit {
  private fb!: FormBuilder;
  private serviceService!: ServiceService;

  @Input() service?: ServiceModel;
  @Output() saved = new EventEmitter<ServiceModel>();
  @Output() cancelled = new EventEmitter<void>();

  form: any;

  constructor() {
    this.fb = inject(FormBuilder);
    this.serviceService = inject(ServiceService);
    this.form = this.fb.nonNullable.group({
      name: ['', Validators.required],
      description: [''],
      category: ['corte' as ServiceCategory, Validators.required],
      duration: [30, [Validators.required, Validators.min(5)]],
      price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    if (this.service) {
      this.form.patchValue(this.service);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const data = this.form.getRawValue();

    const obs = this.service
      ? this.serviceService.update(this.service.id, data)
      : this.serviceService.create({ ...data, isActive: true });

    obs.subscribe((result) => {
      if (result) this.saved.emit(result as ServiceModel);
    });
  }
}

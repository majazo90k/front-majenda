import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { ServiceService } from '../../../../core/services/service.service';
import { ServiceModel } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state.component';
import { ServicioFormComponent } from './servicio-form.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [
    NgIf,
    MatCardModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatTableModule,
    LoadingSpinnerComponent, EmptyStateComponent, ServicioFormComponent, DecimalPipe,
  ],
  template: `
    <div class="servicios">
      <header class="servicios-header">
        <h1>Servicios</h1>
        <button mat-raised-button color="primary" (click)="showForm.set(true)">
          <mat-icon>add</mat-icon> Nuevo servicio
        </button>
      </header>

      <app-loading-spinner [loading]="loading()" text="Cargando servicios..."></app-loading-spinner>

      <app-empty-state
        *ngIf="!loading() && services().length === 0"
        icon="content_cut"
        title="Sin servicios"
        message="Agrega tu primer servicio para empezar."
      ></app-empty-state>

      <app-servicio-form
        *ngIf="showForm()"
        [service]="editingService()"
        (saved)="onSaved($event)"
        (cancelled)="cancelForm()"
      ></app-servicio-form>

      <mat-card *ngIf="!showForm() && services().length > 0">
        <div class="table-wrap">
        <table mat-table [dataSource]="services()">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let s">{{ s.name }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Categoría</th>
            <td mat-cell *matCellDef="let s">{{ categoryLabel(s.category) }}</td>
          </ng-container>

          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef>Duración</th>
            <td mat-cell *matCellDef="let s">{{ s.duration }} min</td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Precio</th>
            <td mat-cell *matCellDef="let s">\${{ s.price | number:'1.0-0' }}</td>
          </ng-container>

          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Activo</th>
            <td mat-cell *matCellDef="let s">
              <mat-slide-toggle [checked]="s.isActive" (toggleChange)="toggleActive(s)"></mat-slide-toggle>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let s">
              <button mat-icon-button color="primary" (click)="editService(s)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteService(s.id)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .servicios-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .servicios-header h1 { margin: 0; }
    table { width: 100%; }
    .table-wrap { overflow-x: auto; }

    @media (max-width: 600px) {
      .servicios-header { flex-direction: column; gap: 0.75rem; align-items: stretch; }
      .servicios-header h1 { text-align: center; }
    }
  `],
})
export class ServiciosComponent implements OnInit {
  private serviceService!: ServiceService;

  services = signal<ServiceModel[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingService = signal<ServiceModel | undefined>(undefined);

  columns = ['name', 'category', 'duration', 'price', 'active', 'actions'];

  constructor() {
    this.serviceService = inject(ServiceService);
  }

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.serviceService.getAll().subscribe((s) => {
      this.services.set(s);
      this.loading.set(false);
    });
  }

  editService(service: ServiceModel): void {
    this.editingService.set(service);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingService.set(undefined);
  }

  onSaved(_service: ServiceModel): void {
    this.cancelForm();
    this.loading.set(true);
    this.loadServices();
  }

  toggleActive(service: ServiceModel): void {
    this.serviceService.update(service.id, { isActive: !service.isActive }).subscribe();
  }

  deleteService(id: string): void {
    if (confirm('¿Eliminar este servicio?')) {
      this.serviceService.delete(id).subscribe(() => this.loadServices());
    }
  }

  categoryLabel(cat: string): string {
    const labels: Record<string, string> = { corte: 'Corte', tintura: 'Tintura', promocion: 'Promoción' };
    return labels[cat] || cat;
  }
}

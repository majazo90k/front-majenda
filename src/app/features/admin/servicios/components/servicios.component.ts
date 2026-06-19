import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { NgIf, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ServiceService } from '../../../../core/services/service.service';
import { ServiceModel } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state.component';
import { ServicioFormComponent } from './servicio-form.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [
    NgIf, DecimalPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatSlideToggleModule,
    MatTableModule, MatSortModule,
    LoadingSpinnerComponent, EmptyStateComponent, ServicioFormComponent,
  ],
  template: `
    <div class="servicios">
      <header class="servicios-header">
        <h1>Servicios</h1>
        <button mat-raised-button color="primary" (click)="showForm.set(true)">
          <mat-icon>add</mat-icon> Nuevo servicio
        </button>
      </header>

      <app-loading-spinner [loading]="loading()" text="Cargando servicios..." />

      <app-empty-state
        *ngIf="!loading() && services().length === 0"
        icon="content_cut" title="Sin servicios"
        message="Agrega tu primer servicio para empezar."
      />

      <app-servicio-form
        *ngIf="showForm()"
        [service]="editingService()"
        (saved)="onSaved($event)"
        (cancelled)="cancelForm()"
      />

      <mat-card *ngIf="!showForm() && services().length > 0">
        <div class="table-wrap">
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
              <td mat-cell *matCellDef="let s">{{ s.name }}</td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Categoría</th>
              <td mat-cell *matCellDef="let s">{{ categoryLabel(s.category) }}</td>
            </ng-container>
            <ng-container matColumnDef="duration">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Duración</th>
              <td mat-cell *matCellDef="let s">{{ s.durationMinutes }} min</td>
            </ng-container>
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Precio</th>
              <td mat-cell *matCellDef="let s">\${{ s.priceCLP | number:'1.0-0' }}</td>
            </ng-container>
            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Activo</th>
              <td mat-cell *matCellDef="let s">
                <mat-slide-toggle [checked]="s.active" (change)="toggleActive(s, $event)"></mat-slide-toggle>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let s">
                <button mat-icon-button (click)="editService(s)" matTooltip="Editar" class="!text-indigo-500"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button (click)="deleteService(s)" matTooltip="Eliminar" class="!text-rose-400"><mat-icon>delete</mat-icon></button>
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
    .servicios-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .servicios-header h1 { margin: 0; }
    .table-wrap { overflow-x: auto; }
    .servicios { padding: 0 1.5rem; }
    table { width: 100%; }
    th.mat-header-cell .mat-sort-header-arrow { color: #6366f1; }
    @media (max-width: 600px) {
      .servicios { padding: 0 1rem; }
      .servicios-header { flex-direction: column; gap: 0.75rem; align-items: stretch; }
      .servicios-header h1 { text-align: center; }
    }
  `],
})
export class ServiciosComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  services = signal<ServiceModel[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingService = signal<ServiceModel | undefined>(undefined);

  dataSource = new MatTableDataSource<ServiceModel>([]);
  columns = ['name', 'category', 'duration', 'price', 'active', 'actions'];

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.serviceService.getAll().subscribe((s) => {
      this.services.set(s);
      this.dataSource.data = s;
      this.loading.set(false);
    });
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingService.set(undefined);
  }

  onSaved(_service: ServiceModel): void {
    this.cancelForm();
    this.snackBar.open('Servicio guardado correctamente', 'Cerrar', { duration: 3000 });
    this.loading.set(true);
    this.loadServices();
  }

  editService(service: ServiceModel): void {
    this.editingService.set(service);
    this.showForm.set(true);
  }

  toggleActive(service: ServiceModel, event: any): void {
    event.source.checked = service.active;
    if (service.active) {
      this.deactivateService(service);
    } else {
      this.activateService(service);
    }
  }

  private activateService(service: ServiceModel): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Activar servicio',
        message: `¿Activar "${service.name}" para que esté disponible en la agenda?`,
        confirmText: 'Activar',
        cancelText: 'Cancelar',
        icon: 'check_circle',
        variant: 'primary',
      },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.serviceService.activate(service.id).subscribe(() => {
        this.snackBar.open('Servicio activado', 'Cerrar', { duration: 3000 });
        this.loadServices();
      });
    });
  }

  private deactivateService(service: ServiceModel): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar servicio',
        message: `¿Desactivar "${service.name}"? Dejará de estar disponible en la agenda.`,
        confirmText: 'Desactivar',
        cancelText: 'Cancelar',
        icon: 'visibility_off',
        variant: 'warning',
      },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.serviceService.deactivate(service.id).subscribe(() => {
        this.snackBar.open('Servicio desactivado', 'Cerrar', { duration: 3000 });
        this.loadServices();
      });
    });
  }

  deleteService(service: ServiceModel): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar servicio',
        message: `¿Eliminar "${service.name}" permanentemente? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        icon: 'delete',
        variant: 'danger',
      },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.serviceService.delete(service.id).subscribe(() => {
        this.snackBar.open('Servicio eliminado', 'Cerrar', { duration: 3000 });
        this.loadServices();
      });
    });
  }

  categoryLabel(cat: string): string {
    const labels: Record<string, string> = { CORTE: 'Corte', TINTURA: 'Tintura', PROMOCION: 'Promoción', corte: 'Corte', tintura: 'Tintura', promocion: 'Promoción' };
    return labels[cat] || cat;
  }
}

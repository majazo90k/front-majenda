import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BookingData } from './public-booking.component';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [NgIf, DatePipe, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <ng-container *ngIf="!isConfirmed; else confirmedView">
      <mat-card class="summary-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>calendar_today</mat-icon>
          <mat-card-title>Resumen de tu cita</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="row"><span class="label">Servicio</span><span class="value">{{ booking.service?.name || '-' }}</span></div>
          <div class="row" *ngIf="booking.staff"><span class="label">Profesional</span><span class="value">{{ booking.staff.name }}</span></div>
          <div class="row" *ngIf="booking.date"><span class="label">Fecha</span><span class="value">{{ booking.date | date:'fullDate' }}</span></div>
          <div class="row" *ngIf="booking.slot"><span class="label">Hora</span><span class="value">{{ booking.slot.start | date:'HH:mm' }} - {{ booking.slot.end | date:'HH:mm' }}</span></div>
          <div class="row" *ngIf="booking.client"><span class="label">Cliente</span><span class="value">{{ booking.client.name }}</span></div>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-stroked-button (click)="cancel.emit()"><mat-icon>close</mat-icon> Cancelar</button>
          <button mat-raised-button color="primary" (click)="confirm.emit()"><mat-icon>check_circle</mat-icon> Confirmar cita</button>
        </mat-card-actions>
      </mat-card>
    </ng-container>

    <ng-template #confirmedView>
      <mat-card class="success-card">
        <mat-card-content class="success-content">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <h2>¡Cita agendada!</h2>
          <p>Te enviamos un resumen a tu correo.</p>
          <div class="row"><span class="label">Fecha</span><span class="value">{{ booking.date | date:'fullDate' }}</span></div>
          <div class="row"><span class="label">Hora</span><span class="value">{{ booking.slot?.start | date:'HH:mm' }}</span></div>
        </mat-card-content>
      </mat-card>
    </ng-template>
  `,
  styles: [`
    .summary-card { max-width: 500px; margin: 0 auto; }
    .row { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid #f1f5f9; }
    .label { color: #64748b; font-weight: 500; }
    .value { font-weight: 600; color: #1e293b; }
    .success-content { text-align: center; padding: 2rem; }
    .success-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #22c55e; }
    .success-card { background: #f0fdf4; max-width: 500px; margin: 0 auto; }
  `],
})
export class BookingConfirmationComponent {
  @Input({ required: true }) booking!: BookingData;
  @Input() isConfirmed = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}

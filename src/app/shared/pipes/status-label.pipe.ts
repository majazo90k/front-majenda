import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../../core/models';

const LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Completado',
};

const COLORS: Record<AppointmentStatus, string> = {
  pending: '#f59e0b',
  confirmed: '#10b981',
  cancelled: '#ef4444',
  completed: '#6b7280',
};

@Pipe({ name: 'statusLabel', standalone: true })
export class StatusLabelPipe implements PipeTransform {
  transform(value: AppointmentStatus): string {
    return LABELS[value] || value;
  }
}

@Pipe({ name: 'statusColor', standalone: true })
export class StatusColorPipe implements PipeTransform {
  transform(value: AppointmentStatus): string {
    return COLORS[value] || '#6b7280';
  }
}

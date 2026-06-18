import { Pipe, PipeTransform } from '@angular/core';

const LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Completado',
};

const COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#10b981',
  CANCELLED: '#ef4444',
  COMPLETED: '#6b7280',
};

@Pipe({ name: 'statusLabel', standalone: true })
export class StatusLabelPipe implements PipeTransform {
  transform(value: string): string {
    return LABELS[value] || value;
  }
}

@Pipe({ name: 'statusColor', standalone: true })
export class StatusColorPipe implements PipeTransform {
  transform(value: string): string {
    return COLORS[value] || '#6b7280';
  }
}

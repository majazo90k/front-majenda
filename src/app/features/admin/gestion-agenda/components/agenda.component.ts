import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { Appointment } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface CalendarDay {
  date: Date | null;
  count: number;
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth: boolean;
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, MatButtonModule, MatIconModule, MatTooltipModule, LoadingSpinnerComponent],
  template: `
    <div class="p-4 md:p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Agenda</h1>
        <span class="text-sm text-gray-400">{{ selectedDate() | date:'fullDate' }}</span>
      </div>

      <app-loading-spinner [loading]="loading()" text="Cargando agenda..." />

      <ng-container *ngIf="!loading()">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <!-- Calendar -->
          <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div class="flex items-center justify-between mb-4">
              <button mat-icon-button (click)="prevMonth()"><mat-icon>chevron_left</mat-icon></button>
              <h2 class="text-base font-semibold text-gray-800">{{ MONTHS[viewDate().getMonth()] }} {{ viewDate().getFullYear() }}</h2>
              <button mat-icon-button (click)="nextMonth()"><mat-icon>chevron_right</mat-icon></button>
            </div>

            <div class="grid grid-cols-7 mb-1">
              <div *ngFor="let d of DAYS" class="text-center text-[10px] font-medium text-gray-400 py-1">{{ d }}</div>
            </div>

            <div class="grid grid-cols-7 gap-0.5">
              <button *ngFor="let day of calendarDays()"
                class="relative flex flex-col items-center justify-center rounded-lg p-1 min-h-[40px] transition-all text-xs font-medium
                  focus:outline-none focus:ring-2 focus:ring-indigo-300"
                [class.hover:bg-indigo-200]="day.isSelected"
                [class.hover:bg-gray-50]="!day.isSelected"
                [class.invisible]="!day.date"
                [class.text-gray-400]="day.isOtherMonth"
                [class.text-gray-800]="!day.isOtherMonth && !day.isSelected"
                [class.bg-indigo-100]="day.isSelected"
                [class.text-indigo-700]="day.isSelected"
                [class.ring-2]="day.isToday && !day.isSelected"
                [class.ring-indigo-300]="day.isToday && !day.isSelected"
                (click)="selectDay(day)"
                [disabled]="!day.date">
                <span class="text-xs leading-none">{{ day.date ? day.date.getDate() : '' }}</span>
                <div *ngIf="day.count > 0" class="flex gap-0.5 mt-1">
                  <span *ngFor="let _ of [].constructor(Math.min(day.count, 3))" class="w-1 h-1 rounded-full bg-indigo-300"></span>
                  <span *ngIf="day.count > 3" class="text-[9px] leading-none font-bold text-indigo-400">+{{ day.count - 3 }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Day schedule -->
          <div class="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-500">{{ formatDate(selectedDate()) }}</h3>
              <span class="text-xs font-medium text-gray-400">{{ dayAppointments().length }} cita{{ dayAppointments().length !== 1 ? 's' : '' }}</span>
            </div>

            <div *ngIf="dayAppointments().length === 0" class="text-center py-10">
              <div class="text-3xl mb-2">📅</div>
              <p class="text-gray-400 text-sm">No hay citas para este día</p>
            </div>

            <div class="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              <div *ngFor="let apt of dayAppointments()"
                class="flex items-stretch gap-0 rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-sm transition-shadow">

                <!-- Time column -->
                <div class="flex flex-col items-center justify-center w-16 flex-shrink-0 bg-gray-50 py-2">
                  <span class="text-sm font-bold text-gray-800 leading-tight">{{ formatTime(apt.startTime) }}</span>
                  <span class="text-[10px] text-gray-400 leading-tight">{{ formatTime(apt.endTime) }}</span>
                </div>

                <!-- Color bar -->
                <div class="w-1 flex-shrink-0" [class.bg-amber-400]="apt.status === 'PENDING'"
                  [class.bg-indigo-400]="apt.status === 'CONFIRMED'"
                  [class.bg-emerald-400]="apt.status === 'COMPLETED'"
                  [class.bg-rose-300]="apt.status === 'CANCELLED'"></div>

                <!-- Content -->
                <div class="flex-1 min-w-0 px-3 py-2">
                  <div class="flex items-center gap-1.5">
                    <span class="font-semibold text-sm text-gray-900 truncate">{{ apt.clientName }}</span>
                    <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                      [class.bg-amber-100]="apt.status === 'PENDING'" [class.text-amber-700]="apt.status === 'PENDING'"
                      [class.bg-indigo-100]="apt.status === 'CONFIRMED'" [class.text-indigo-700]="apt.status === 'CONFIRMED'"
                      [class.bg-emerald-100]="apt.status === 'COMPLETED'" [class.text-emerald-700]="apt.status === 'COMPLETED'"
                      [class.bg-rose-100]="apt.status === 'CANCELLED'" [class.text-rose-600]="apt.status === 'CANCELLED'">
                      {{ statusLabel(apt.status) }}
                    </span>
                  </div>
                  <p class="text-[11px] text-gray-500 mt-0.5 truncate">{{ apt.serviceName }} · {{ apt.staffName }}</p>
                  <p class="text-[11px] text-gray-400 truncate">{{ apt.clientPhone }}</p>
                </div>

                <!-- Actions always visible -->
                <div class="flex items-center gap-0.5 pr-2 flex-shrink-0 bg-white">
                  <button mat-icon-button matTooltip="Confirmar" *ngIf="apt.status === 'PENDING'"
                    class="!w-7 !h-7 hover:bg-emerald-50" (click)="changeStatus(apt.id, 'CONFIRMED')">
                    <mat-icon class="!text-base !text-emerald-500">check_circle</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Completar" *ngIf="apt.status === 'CONFIRMED'"
                    class="!w-7 !h-7 hover:bg-blue-50" (click)="changeStatus(apt.id, 'COMPLETED')">
                    <mat-icon class="!text-base !text-blue-500">task_alt</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Cancelar" *ngIf="apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'"
                    class="!w-7 !h-7 hover:bg-rose-50" (click)="cancelAppointment(apt)">
                    <mat-icon class="!text-base !text-rose-400">cancel</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class AgendaComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  readonly DAYS = DAYS;
  readonly MONTHS = MONTHS;
  readonly Math = Math;

  loading = signal(true);
  viewDate = signal(new Date());
  selectedDate = signal(new Date());
  appointments = signal<Appointment[]>([]);

  calendarDays = computed<CalendarDay[]>(() => {
    const year = this.viewDate().getFullYear();
    const month = this.viewDate().getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const todayStr = new Date().toDateString();
    const selStr = this.selectedDate().toDateString();

    const byDay: Record<string, number> = {};
    for (const a of this.appointments()) {
      const d = new Date(a.startTime).toDateString();
      byDay[d] = (byDay[d] || 0) + 1;
    }

    const days: CalendarDay[] = [];
    for (let i = 0; i < startPad; i++) days.push({ date: null, count: 0, isToday: false, isSelected: false, isOtherMonth: false });

    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toDateString();
      days.push({
        date,
        count: byDay[dateStr] || 0,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selStr,
        isOtherMonth: false,
      });
    }
    return days;
  });

  dayAppointments = computed(() => {
    const selStr = this.selectedDate().toDateString();
    return this.appointments()
      .filter((a) => new Date(a.startTime).toDateString() === selStr)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  ngOnInit(): void {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    this.appointmentService.getAll().subscribe((apps) => {
      this.appointments.set(apps);
      this.loading.set(false);
    });
  }

  prevMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() - 1);
    this.viewDate.set(d);
  }

  nextMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() + 1);
    this.viewDate.set(d);
  }

  selectDay(day: CalendarDay): void {
    if (day.date) this.selectedDate.set(day.date);
  }

  changeStatus(id: string, status: string): void {
    this.appointmentService.updateStatus(id, status).subscribe(() => {
      this.loadAppointments();
    });
  }

  cancelAppointment(apt: Appointment): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancelar cita',
        message: `¿Cancelar la cita de ${apt.clientName}? Te recomendamos enviar un WhatsApp al ${apt.clientPhone} para notificarle.`,
        confirmText: 'Cancelar cita',
        cancelText: 'Volver',
        icon: 'cancel',
        variant: 'danger',
      },
    }).afterClosed().subscribe((result) => {
      if (!result) return;
      this.appointmentService.updateStatus(apt.id, 'CANCELLED').subscribe(() => {
        this.snackBar.open(`Cita cancelada · ${apt.clientName}`, 'Cerrar', { duration: 3000 });
        this.loadAppointments();
      });
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', COMPLETED: 'Completada', CANCELLED: 'Cancelada' };
    return map[s] || s;
  }

  formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  }
}

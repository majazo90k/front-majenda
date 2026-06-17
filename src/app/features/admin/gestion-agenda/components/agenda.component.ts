import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgFor, NgIf, DatePipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ServiceService } from '../../../../core/services/service.service';
import { Appointment, AppointmentStatus, ServiceModel } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner.component';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface CalendarDay {
  date: Date | null;
  count: number;
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-400',
  confirmed: 'bg-indigo-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-rose-400',
};

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, NgClass, MatButtonModule, MatIconModule, MatTooltipModule, LoadingSpinnerComponent],
  template: `
    <div class="p-4 md:p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Agenda</h1>
        <span class="text-sm text-gray-400">{{ selectedDate() | date:'fullDate' }}</span>
      </div>

      <app-loading-spinner [loading]="loading()" text="Cargando agenda..." />

      <ng-container *ngIf="!loading()">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Calendar -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <!-- Month nav -->
            <div class="flex items-center justify-between mb-5">
              <button mat-icon-button (click)="prevMonth()"><mat-icon>chevron_left</mat-icon></button>
              <h2 class="text-lg font-semibold text-gray-800">{{ MONTHS[viewDate().getMonth()] }} {{ viewDate().getFullYear() }}</h2>
              <button mat-icon-button (click)="nextMonth()"><mat-icon>chevron_right</mat-icon></button>
            </div>

            <!-- Day headers -->
            <div class="grid grid-cols-7 mb-2">
              <div *ngFor="let d of DAYS" class="text-center text-xs font-medium text-gray-400 py-1">{{ d }}</div>
            </div>

            <!-- Calendar grid -->
            <div class="grid grid-cols-7 gap-1">
              <button *ngFor="let day of calendarDays()"
                class="relative flex flex-col items-center justify-center rounded-xl p-2 min-h-[56px] transition-all text-sm font-medium
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                [class.invisible]="!day.date"
                [class.text-gray-400]="day.isOtherMonth"
                [class.text-gray-800]="!day.isOtherMonth && !day.isSelected"
                [class.bg-indigo-600]="day.isSelected"
                [class.text-white]="day.isSelected"
                [class.ring-2]="day.isToday && !day.isSelected"
                [class.ring-indigo-400]="day.isToday && !day.isSelected"
                (click)="selectDay(day)"
                [disabled]="!day.date">
                <span class="text-sm leading-none">{{ day.date ? day.date.getDate() : '' }}</span>
                <div *ngIf="day.count > 0" class="flex gap-0.5 mt-1.5">
                  <span *ngFor="let _ of [].constructor(Math.min(day.count, 4))" class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span *ngIf="day.count > 4" class="text-[10px] leading-none font-bold text-indigo-500">+{{ day.count - 4 }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Day schedule -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {{ selectedDate() | date:'fullDate' }}
              </h3>
              <span class="text-xs font-medium text-gray-400">{{ dayAppointments().length }} citas</span>
            </div>

            <!-- Time slots / timeline -->
            <div *ngIf="dayAppointments().length === 0" class="text-center py-12">
              <div class="text-4xl mb-3">📅</div>
              <p class="text-gray-400 text-sm">No hay citas para este día</p>
              <p class="text-gray-300 text-xs mt-1">Selecciona otro día o crea una nueva cita</p>
            </div>

            <div class="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              <div *ngFor="let apt of dayAppointments()" class="group relative flex gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 border border-transparent hover:border-gray-200">
                <!-- Time line indicator -->
                <div class="flex flex-col items-center w-14 flex-shrink-0">
                  <span class="text-xs font-bold text-gray-700">{{ formatTime(apt.startTime) }}</span>
                  <span class="text-[10px] text-gray-400 -mt-0.5">{{ formatTime(apt.endTime) }}</span>
                </div>

                <!-- Color bar -->
                <div class="w-1 rounded-full flex-shrink-0" [class.bg-amber-400]="apt.status === 'pending'"
                  [class.bg-indigo-500]="apt.status === 'confirmed'"
                  [class.bg-emerald-500]="apt.status === 'completed'"
                  [class.bg-rose-400]="apt.status === 'cancelled'"></div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-sm text-gray-900 truncate">{{ apt.clientName }}</span>
                    <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                      [class.bg-amber-50]="apt.status === 'pending'" [class.text-amber-600]="apt.status === 'pending'"
                      [class.bg-indigo-50]="apt.status === 'confirmed'" [class.text-indigo-600]="apt.status === 'confirmed'"
                      [class.bg-emerald-50]="apt.status === 'completed'" [class.text-emerald-600]="apt.status === 'completed'"
                      [class.bg-rose-50]="apt.status === 'cancelled'" [class.text-rose-600]="apt.status === 'cancelled'">
                      {{ statusLabel(apt.status) }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5">{{ getServiceName(apt.serviceId) }} · {{ getStaffName(apt.staffId) }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ apt.clientPhone }} · {{ apt.clientEmail }}</p>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button mat-icon-button color="primary" matTooltip="Confirmar" *ngIf="apt.status === 'pending'"
                    class="!w-8 !h-8 !text-emerald-600 hover:bg-emerald-50" (click)="changeStatus(apt.id, 'confirmed')">
                    <mat-icon class="!text-lg">check_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" matTooltip="Completar" *ngIf="apt.status === 'confirmed'"
                    class="!w-8 !h-8 !text-blue-600 hover:bg-blue-50" (click)="changeStatus(apt.id, 'completed')">
                    <mat-icon class="!text-lg">task_alt</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Cancelar" *ngIf="apt.status !== 'cancelled' && apt.status !== 'completed'"
                    class="!w-8 !h-8 !text-rose-500 hover:bg-rose-50" (click)="cancelAppointment(apt)">
                    <mat-icon class="!text-lg">cancel</mat-icon>
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
  private serviceService = inject(ServiceService);
  private snackBar = inject(MatSnackBar);

  readonly DAYS = DAYS;
  readonly MONTHS = MONTHS;
  readonly Math = Math;

  loading = signal(true);
  viewDate = signal(new Date());
  selectedDate = signal(new Date());
  appointments = signal<Appointment[]>([]);
  services: ServiceModel[] = [];

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
    this.serviceService.getAll().subscribe((s) => { this.services = s; });
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

  changeStatus(id: string, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(id, status).subscribe(() => {
      this.loadAppointments();
    });
  }

  cancelAppointment(apt: Appointment): void {
    const confirmed = confirm(`¿Cancelar cita de ${apt.clientName}?\nTe recomendamos enviar un WhatsApp al ${apt.clientPhone} para notificarle.`);
    if (!confirmed) return;
    this.appointmentService.updateStatus(apt.id, 'cancelled').subscribe(() => {
      this.snackBar.open(`Cita cancelada · ${apt.clientName}`, 'Cerrar', { duration: 3000 });
      this.loadAppointments();
    });
  }

  getServiceName(id: string): string {
    return this.services.find((s) => s.id === id)?.name || id;
  }

  getStaffName(id: string): string {
    const names: Record<string, string> = { 'stf-1': 'Carlos Muñoz', 'stf-2': 'María González' };
    return names[id] || id;
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada' };
    return map[s] || s;
  }

  formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }
}

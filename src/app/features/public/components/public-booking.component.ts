import { Component, inject, computed, signal, viewChild } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ServiceService } from '../../../core/services/service.service';
import { StaffService } from '../../../core/services/staff.service';
import { ServiceModel, ServiceCategory, Staff, TimeSlot } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { HttpParams } from '@angular/common/http';
import { BookingCalendarComponent } from './booking-calendar.component';
import { TimeSlotPickerComponent } from './time-slot-picker.component';
import { BookingFormComponent } from './booking-form.component';
import { BookingConfirmationComponent } from './booking-confirmation.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

export interface BookingData {
  service?: ServiceModel;
  staff?: Staff;
  date: Date | null;
  slot: TimeSlot | null;
  client: { name: string; phone: string; email: string } | null;
}

@Component({
  selector: 'app-public-booking',
  standalone: true,
  imports: [
    NgIf, NgFor, DecimalPipe,
    MatStepperModule, MatButtonModule, MatIconModule,
    BookingCalendarComponent,
    TimeSlotPickerComponent,
    BookingFormComponent,
    BookingConfirmationComponent,
  ],
  template: `
    <div class="page">
      <div class="container">
        <div class="hero">
          <h1>Agenda tu cita</h1>
          <p>Selecciona servicio, elige un horario y confirma en pocos pasos.</p>
        </div>

        <div *ngIf="confirmedBooking() as confirmed" class="confirmed-banner">
          <app-booking-confirmation [booking]="confirmed" [isConfirmed]="true"></app-booking-confirmation>
          <div class="text-center mt-4"><button mat-stroked-button (click)="clearConfirmed()">Agendar nueva cita</button></div>
        </div>

        <mat-stepper *ngIf="!confirmedBooking()" linear #stepper class="booking-stepper" [attr.data-key]="bookingKey()">
          <ng-template matStepperIcon="number" let-index="index"><mat-icon class="step-icon">{{ stepIcons[index] }}</mat-icon></ng-template>
          <ng-template matStepperIcon="edit" let-index="index"><mat-icon class="step-icon">{{ stepIcons[index] }}</mat-icon></ng-template>

          <mat-step [completed]="!!booking().service">
            <ng-template matStepLabel><span class="step-label-text">Servicio</span></ng-template>
            <div class="step-body">
              <p class="step-title" *ngIf="services().length > 0">¿Qué servicio necesitas?</p>
              <div class="filter-bar" *ngIf="services().length > 0">
                <button mat-stroked-button class="filter-chip" [class.active]="selectedCategory() === null" (click)="selectedCategory.set(null)">Todos</button>
                <button mat-stroked-button class="filter-chip" [class.active]="selectedCategory() === 'CORTE'" (click)="selectedCategory.set('CORTE')"><mat-icon>content_cut</mat-icon> Corte</button>
                <button mat-stroked-button class="filter-chip" [class.active]="selectedCategory() === 'TINTURA'" (click)="selectedCategory.set('TINTURA')"><mat-icon>palette</mat-icon> Tintura</button>
                <button mat-stroked-button class="filter-chip" [class.active]="selectedCategory() === 'PROMOCION'" (click)="selectedCategory.set('PROMOCION')"><mat-icon>local_offer</mat-icon> Promociones</button>
              </div>
              <div class="grid-2cols" *ngIf="filteredServices().length > 0">
                <button *ngFor="let s of filteredServices()" mat-stroked-button class="option-card" [class.selected]="booking().service?.id === s.id" (click)="selectService(s)">
                  <mat-icon>content_cut</mat-icon>
                  <div class="option-name">{{ s.name }}</div>
                  <div class="option-detail">{{ s.durationMinutes }} min</div>
                  <div class="option-price">\${{ s.priceCLP | number:'1.0-0':'es-CL' }}</div>
                </button>
              </div>
              <div class="empty-filter" *ngIf="filteredServices().length === 0 && selectedCategory() !== null">
                <p>No hay servicios disponibles en esta categoría.</p>
              </div>
              <div class="step-actions">
                <button mat-raised-button color="primary" [disabled]="!booking().service" (click)="nextStep(stepper)">Siguiente <mat-icon>chevron_right</mat-icon></button>
              </div>
            </div>
          </mat-step>

          <mat-step [completed]="!!booking().staff">
            <ng-template matStepLabel><span class="step-label-text">Profesional</span></ng-template>
            <div class="step-body">
              <p class="step-title" *ngIf="staff().length > 0">Elige a tu profesional</p>
              <div class="grid-2cols" *ngIf="staff().length > 0">
                <button *ngFor="let p of staff()" mat-stroked-button class="option-card" [class.selected]="booking().staff?.id === p.id" (click)="selectStaff(p)">
                  <mat-icon>person</mat-icon>
                  <span class="option-name">{{ p.name }}</span>
                </button>
              </div>
              <div class="step-actions step-actions-between">
                <button mat-stroked-button (click)="stepper.previous()"><mat-icon>chevron_left</mat-icon> Atrás</button>
                <button mat-raised-button color="primary" [disabled]="!booking().staff" (click)="nextStep(stepper)">Siguiente <mat-icon>chevron_right</mat-icon></button>
              </div>
            </div>
          </mat-step>

          <mat-step [completed]="!!booking().date && !!booking().slot">
            <ng-template matStepLabel><span class="step-label-text">Fecha y hora</span></ng-template>
            <div class="step-body">
              <p class="step-title">Elige día y horario</p>
              <app-booking-calendar [selectedDate]="booking().date" (dateSelected)="onDateSelected($event)"></app-booking-calendar>
              <app-time-slot-picker [slots]="availableSlots()" [selectedSlot]="booking().slot" (slotSelected)="selectSlot($event)"></app-time-slot-picker>
              <div class="step-actions step-actions-between">
                <button mat-stroked-button (click)="stepper.previous()"><mat-icon>chevron_left</mat-icon> Atrás</button>
                <button mat-raised-button color="primary" [disabled]="!booking().date || !booking().slot" (click)="nextStepDate(stepper)">Siguiente <mat-icon>chevron_right</mat-icon></button>
              </div>
            </div>
          </mat-step>

          <mat-step [completed]="!!booking().client">
            <ng-template matStepLabel><span class="step-label-text">Tus datos</span></ng-template>
            <div class="step-body">
              <p class="step-title">Completa tus datos</p>
              <app-booking-form (submitted)="onClientSubmit($event, stepper)"></app-booking-form>
              <div class="step-actions">
                <button mat-stroked-button (click)="stepper.previous()"><mat-icon>chevron_left</mat-icon> Atrás</button>
              </div>
            </div>
          </mat-step>

          <mat-step [editable]="false">
            <ng-template matStepLabel><span class="step-label-text">Confirmar</span></ng-template>
            <div class="step-body">
              <app-booking-confirmation [booking]="booking()" [isConfirmed]="isConfirmed()" (confirm)="onConfirm()" (cancel)="resetBooking()"></app-booking-confirmation>
            </div>
          </mat-step>
        </mat-stepper>

        <footer class="footer">
          Majenda - By majazo
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%); display: flex; justify-content: center; padding: 1rem; }
    .container { width: 100%; max-width: 780px; }
    .hero { text-align: center; padding: 2rem 1rem 1.5rem; }
    .hero h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; color: #1e293b; }
    .hero p { color: #64748b; font-size: 1.05rem; margin: 0; }
    .booking-stepper { background: transparent; }
    .step-body { padding: 1.5rem 0.5rem; }
    .step-title { font-size: 1.1rem; font-weight: 600; color: #334155; margin: 0 0 1.25rem; }
    .grid-2cols { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .option-card { display: flex; flex-direction: column !important; align-items: center; gap: 0.5rem; padding: 1.75rem 1rem; height: auto; white-space: normal; line-height: 1.4; border-radius: 12px; border: 2px solid #e2e8f0; transition: all 0.2s; background: white; cursor: pointer; }
    .option-card:hover { border-color: #818cf8; background: #eef2ff; }
    .option-card.selected { border-color: #6366f1; background: #eef2ff; }
    .option-card mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #6366f1; }
    .option-name { font-weight: 700; font-size: 1.05rem; color: #1e293b; margin-top: 0.25rem; }
    .option-detail { font-size: 0.85rem; color: #64748b; }
    .option-price { font-size: 1.15rem; font-weight: 800; color: #059669; margin-top: 0.15rem; }
    .filter-bar { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
    .filter-chip { display: flex; align-items: center; gap: 0.3rem; padding: 0.3rem 1rem; border-radius: 20px; border: 2px solid #e2e8f0; background: white; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .filter-chip:hover { border-color: #818cf8; background: #eef2ff; }
    .filter-chip.active { border-color: #6366f1; background: #6366f1; color: white; }
    .filter-chip mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .filter-chip.active mat-icon { color: white; }
    .empty-filter { text-align: center; padding: 2rem 1rem; color: #94a3b8; }
    .footer { text-align: center; padding: 1.5rem 0 0.5rem; font-size: 0.75rem; color: #94a3b8; }
    .step-actions { margin-top: 1.5rem; }
    .step-actions-between { display: flex; justify-content: space-between; align-items: center; }
    @media (max-width: 600px) {
      .hero { padding: 1.5rem 0.5rem 1rem; }
      .hero h1 { font-size: 1.5rem; }
      .hero p { font-size: 0.95rem; }
      .step-body { padding: 1rem 0; }
      .grid-2cols { grid-template-columns: 1fr; }
      .option-card { padding: 1.25rem 0.75rem; }
      .filter-bar { gap: 0.35rem; }
      .filter-chip { padding: 0.25rem 0.75rem; font-size: 0.8rem; }
      :host ::ng-deep .booking-stepper .step-label-text { display: none; }
      :host ::ng-deep .booking-stepper .mat-horizontal-stepper-header { padding: 16px 4px; }
      :host ::ng-deep .booking-stepper .step-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `],
})
export class PublicBookingComponent {
  private serviceService = inject(ServiceService);
  private staffService = inject(StaffService);
  private api = inject(ApiService);
  private dialog = inject(MatDialog);

  services = signal<ServiceModel[]>([]);
  selectedCategory = signal<ServiceCategory | null>(null);
  filteredServices = computed(() => {
    const cat = this.selectedCategory();
    return cat ? this.services().filter((s) => s.category === cat) : this.services();
  });
  staff = signal<Staff[]>([]);
  availableSlots = signal<TimeSlot[]>([]);
  isConfirmed = signal(false);
  private stepperRef = viewChild<MatStepper>('stepper');
  bookingKey = signal(0);

  stepIcons = ['content_cut', 'person', 'calendar_today', 'edit_note', 'check_circle'];

  booking = signal<BookingData>({
    service: undefined,
    staff: undefined,
    date: new Date(),
    slot: null,
    client: null,
  });

  confirmedBooking = signal<BookingData | null>(this.loadConfirmed());

  constructor() {
    this.serviceService.getActive().subscribe((s) => {
      this.services.set(s);
      if (s.length === 1) this.booking.update((b) => ({ ...b, service: s[0] }));
    });
    this.staffService.getAll().subscribe((s) => {
      this.staff.set(s);
      if (s.length === 1) this.booking.update((b) => ({ ...b, staff: s[0] }));
      this.loadSlots(this.booking().date!);
    });
  }

  selectService(service: ServiceModel): void {
    this.booking.update((b) => ({ ...b, service }));
  }

  selectStaff(staff: Staff): void {
    this.booking.update((b) => ({ ...b, staff, slot: null }));
    if (this.booking().date) {
      this.loadSlots(this.booking().date!);
    }
  }

  nextStepDate(stepper: MatStepper): void {
    if (!this.booking().slot) {
      this.dialog.open(ConfirmDialogComponent, {
        data: { title: 'Selecciona un horario', message: 'Debes elegir un horario disponible para continuar.', variant: 'warning', confirmText: 'Entendido', cancelText: undefined },
      });
    } else {
      stepper.next();
    }
  }

  nextStep(stepper: MatStepper): void {
    const b = this.booking();
    const selectedIndex = stepper.selectedIndex;

    if (selectedIndex === 0 && !b.service) {
      this.dialog.open(ConfirmDialogComponent, {
        data: { title: 'Selecciona un servicio', message: 'Debes elegir un servicio para continuar.', variant: 'warning', confirmText: 'Entendido', cancelText: undefined },
      });
      return;
    }
    if (selectedIndex === 1 && !b.staff) {
      this.dialog.open(ConfirmDialogComponent, {
        data: { title: 'Selecciona un profesional', message: 'Debes elegir un profesional para continuar.', variant: 'warning', confirmText: 'Entendido', cancelText: undefined },
      });
      return;
    }

    stepper.next();
  }

  onDateSelected(date: Date): void {
    this.booking.update((b) => ({ ...b, date, slot: null }));
    this.loadSlots(date);
  }

  selectSlot(slot: TimeSlot): void {
    this.booking.update((b) => ({ ...b, slot }));
  }

  onClientSubmit(client: { name: string; phone: string; email: string }, stepper: MatStepper): void {
    this.booking.update((b) => ({ ...b, client }));
    setTimeout(() => stepper.next());
  }

  resetBooking(): void {
    this.booking.set({ service: undefined, staff: undefined, date: new Date(), slot: null, client: null });
    this.availableSlots.set([]);
    this.isConfirmed.set(false);
    this.stepperRef()?.reset();
  }

  onConfirm(): void {
    const b = this.booking();
    if (!b.service || !b.staff || !b.slot || !b.client) return;

    const startStr = new Date((b.slot.start.endsWith('Z') ? b.slot.start : b.slot.start + 'Z')).toISOString();

    this.api.post('/appointments', {
      clientName: b.client.name,
      clientPhone: b.client.phone,
      clientEmail: b.client.email,
      serviceId: b.service.id,
      staffId: b.staff.id,
      startTime: startStr,
    }).subscribe({
      next: () => {
        this.isConfirmed.set(true);
        this.saveConfirmed(b);
      },
      error: (err: any) => {
        const isRateLimit = err?.status === 429;
        const msg = isRateLimit
          ? 'Ya agendaste una cita hace menos de 5 minutos. Espera un poco antes de agendar otra.'
          : 'No se pudo agendar la cita. Intenta de nuevo.';
        this.dialog.open(ConfirmDialogComponent, {
          data: { title: 'Error', message: msg, icon: 'error_outline', variant: 'danger', confirmText: 'Aceptar', cancelText: undefined },
        }).afterClosed().subscribe(() => this.resetBooking());
      },
    });
  }

  clearConfirmed(): void {
    localStorage.removeItem('booking_confirmed');
    this.confirmedBooking.set(null);
    this.booking.set({ service: undefined, staff: undefined, date: new Date(), slot: null, client: null });
    this.isConfirmed.set(false);
  }

  private saveConfirmed(b: BookingData): void {
    try { localStorage.setItem('booking_confirmed', JSON.stringify(b)); } catch {}
  }

  private loadConfirmed(): BookingData | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = localStorage.getItem('booking_confirmed');
      if (raw) return JSON.parse(raw) as BookingData;
    } catch {}
    return null;
  }

  private loadSlots(date: Date): void {
    const staffId = this.booking().staff?.id;
    if (!staffId) return;

    const dateStr = date.toISOString().split('T')[0];
    const params = new HttpParams().set('staffId', staffId).set('date', dateStr);

    this.api.get<{ start: string; end: string }[]>('/availability', params).subscribe((slots) => {
      this.availableSlots.set(slots.map((s) => ({ ...s, isAvailable: true, isBlocked: false })));
    });
  }
}

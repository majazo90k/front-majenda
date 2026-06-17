import { Component, inject, computed, signal } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ServiceService } from '../../../core/services/service.service';
import { StaffService } from '../../../core/services/staff.service';
import { ServiceModel, ServiceCategory, Staff, TimeSlot } from '../../../core/models';
import { BookingCalendarComponent } from './booking-calendar.component';
import { TimeSlotPickerComponent } from './time-slot-picker.component';
import { BookingFormComponent } from './booking-form.component';
import { BookingConfirmationComponent } from './booking-confirmation.component';

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

        <mat-stepper linear #stepper class="booking-stepper">
          <mat-step [completed]="!!booking().service">
            <ng-template matStepLabel>Servicio</ng-template>
            <div class="step-body">
              <p class="step-title" *ngIf="services().length > 0">¿Qué servicio necesitas?</p>
              <div class="filter-bar" *ngIf="services().length > 0">
                <button mat-stroked-button class="filter-chip" [class.active]="selectedCategory() === null" (click)="selectedCategory.set(null)">
                  Todos
                </button>
                <button mat-stroked-button class="filter-chip" [class.active]="selectedCategory() === 'corte'" (click)="selectedCategory.set('corte')">
                  <mat-icon>content_cut</mat-icon> Corte
                </button>
                <button mat-stroked-button class="filter-chip" [class.active]="selectedCategory() === 'tintura'" (click)="selectedCategory.set('tintura')">
                  <mat-icon>palette</mat-icon> Tintura
                </button>
                <button mat-stroked-button class="filter-chip" [class.active]="selectedCategory() === 'promocion'" (click)="selectedCategory.set('promocion')">
                  <mat-icon>local_offer</mat-icon> Promociones
                </button>
              </div>
              <div class="grid-2cols" *ngIf="filteredServices().length > 0">
                <button *ngFor="let s of filteredServices()" mat-stroked-button class="option-card" [class.selected]="booking().service?.id === s.id" (click)="selectService(s)">
                  <mat-icon>content_cut</mat-icon>
                  <div class="option-name">{{ s.name }}</div>
                  <div class="option-detail">{{ s.duration }} min</div>
                  <div class="option-price">\${{ s.price | number:'1.0-0':'es-CL' }}</div>
                </button>
              </div>
              <div class="empty-filter" *ngIf="filteredServices().length === 0 && selectedCategory() !== null">
                <p>No hay servicios disponibles en esta categoría.</p>
              </div>
              <div class="step-actions">
                <button mat-raised-button color="primary" [disabled]="!booking().service" (click)="nextStep(stepper)">
                  Siguiente <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <mat-step [completed]="!!booking().staff">
            <ng-template matStepLabel>Profesional</ng-template>
            <div class="step-body">
              <p class="step-title" *ngIf="staff().length > 0">Elige a tu profesional</p>
              <div class="grid-2cols" *ngIf="staff().length > 0">
                <button *ngFor="let p of staff()" mat-stroked-button class="option-card" [class.selected]="booking().staff?.id === p.id" (click)="selectStaff(p)">
                  <mat-icon>person</mat-icon>
                  <span class="option-name">{{ p.name }}</span>
                </button>
              </div>
              <div class="step-actions step-actions-between">
                <button mat-button (click)="stepper.previous()">Atrás</button>
                <button mat-raised-button color="primary" [disabled]="!booking().staff" (click)="nextStep(stepper)">
                  Siguiente <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <mat-step [completed]="!!booking().date && !!booking().slot">
            <ng-template matStepLabel>Fecha y hora</ng-template>
            <div class="step-body">
              <p class="step-title">Elige día y horario</p>
              <app-booking-calendar [selectedDate]="booking().date" (dateSelected)="onDateSelected($event)"></app-booking-calendar>
              <app-time-slot-picker [slots]="availableSlots()" [selectedSlot]="booking().slot" (slotSelected)="selectSlot($event)"></app-time-slot-picker>
              <div class="step-actions step-actions-between">
                <button mat-button (click)="stepper.previous()">Atrás</button>
                <button mat-raised-button color="primary" [disabled]="!booking().date || !booking().slot" (click)="nextStep(stepper)">
                  Siguiente <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <mat-step [completed]="!!booking().client">
            <ng-template matStepLabel>Tus datos</ng-template>
            <div class="step-body">
              <p class="step-title">Completa tus datos</p>
              <app-booking-form (submitted)="onClientSubmit($event, stepper)"></app-booking-form>
              <div class="step-actions">
                <button mat-button (click)="stepper.previous()">Atrás</button>
              </div>
            </div>
          </mat-step>

          <mat-step [editable]="false">
            <ng-template matStepLabel>Confirmar</ng-template>
            <div class="step-body">
              <app-booking-confirmation [booking]="booking()" [isConfirmed]="isConfirmed()" (confirm)="onConfirm()"></app-booking-confirmation>
            </div>
          </mat-step>
        </mat-stepper>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%);
      display: flex;
      justify-content: center;
      padding: 1rem;
    }
    .container {
      width: 100%;
      max-width: 780px;
    }
    .hero {
      text-align: center;
      padding: 2rem 1rem 1.5rem;
    }
    .hero h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      color: #1e293b;
    }
    .hero p {
      color: #64748b;
      font-size: 1.05rem;
      margin: 0;
    }
    .booking-stepper {
      background: transparent;
    }
    .step-body {
      padding: 1.5rem 0.5rem;
    }
    .step-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 1.25rem;
    }
    .grid-2cols {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .option-card {
      display: flex;
      flex-direction: column !important;
      align-items: center;
      gap: 0.5rem;
      padding: 1.75rem 1rem;
      height: auto;
      white-space: normal;
      line-height: 1.4;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      transition: all 0.2s;
      background: white;
      cursor: pointer;
    }
    .option-card:hover {
      border-color: #818cf8;
      background: #eef2ff;
    }
    .option-card.selected {
      border-color: #6366f1;
      background: #eef2ff;
    }
    .option-card mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #6366f1;
    }
    .option-name {
      font-weight: 700;
      font-size: 1.05rem;
      color: #1e293b;
      margin-top: 0.25rem;
    }
    .option-detail {
      font-size: 0.85rem;
      color: #64748b;
    }
    .option-price {
      font-size: 1.15rem;
      font-weight: 800;
      color: #059669;
      margin-top: 0.15rem;
    }
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .filter-chip {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.3rem 1rem;
      border-radius: 20px;
      border: 2px solid #e2e8f0;
      background: white;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-chip:hover {
      border-color: #818cf8;
      background: #eef2ff;
    }
    .filter-chip.active {
      border-color: #6366f1;
      background: #6366f1;
      color: white;
    }
    .filter-chip mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }
    .filter-chip.active mat-icon {
      color: white;
    }
    .empty-filter {
      text-align: center;
      padding: 2rem 1rem;
      color: #94a3b8;
    }
    .step-actions {
      margin-top: 1.5rem;
    }
    .step-actions-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media (max-width: 600px) {
      .hero { padding: 1.5rem 0.5rem 1rem; }
      .hero h1 { font-size: 1.5rem; }
      .hero p { font-size: 0.95rem; }
      .step-body { padding: 1rem 0.25rem; }
      .grid-2cols { grid-template-columns: 1fr; }
      .option-card { padding: 1.25rem 0.75rem; }
      .filter-bar { gap: 0.35rem; }
      .filter-chip { padding: 0.25rem 0.75rem; font-size: 0.8rem; }
      .booking-stepper { margin: 0 -0.5rem; }
    }
  `],
})
export class PublicBookingComponent {
  private serviceService = inject(ServiceService);
  private staffService = inject(StaffService);

  services = signal<ServiceModel[]>([]);
  selectedCategory = signal<ServiceCategory | null>(null);
  filteredServices = computed(() => {
    const cat = this.selectedCategory();
    return cat ? this.services().filter((s) => s.category === cat) : this.services();
  });
  staff = signal<Staff[]>([]);
  availableSlots = signal<TimeSlot[]>([]);
  isConfirmed = signal(false);

  booking = signal<BookingData>({
    service: undefined,
    staff: undefined,
    date: null,
    slot: null,
    client: null,
  });

  constructor() {
    this.serviceService.getActive().subscribe((s) => {
      this.services.set(s);
      if (s.length === 1) this.booking.update((b) => ({ ...b, service: s[0] }));
    });
    this.staffService.getAll().subscribe((s) => {
      this.staff.set(s);
      if (s.length === 1) this.booking.update((b) => ({ ...b, staff: s[0] }));
    });
  }

  selectService(service: ServiceModel): void {
    this.booking.update((b) => ({ ...b, service }));
  }

  selectStaff(staff: Staff): void {
    this.booking.update((b) => ({ ...b, staff }));
  }

  nextStep(stepper: MatStepper): void {
    stepper.next();
  }

  onDateSelected(date: Date): void {
    this.booking.update((b) => ({ ...b, date, slot: null }));
    this.generateSlots(date);
  }

  selectSlot(slot: TimeSlot): void {
    this.booking.update((b) => ({ ...b, slot }));
  }

  onClientSubmit(client: { name: string; phone: string; email: string }, stepper: MatStepper): void {
    this.booking.update((b) => ({ ...b, client }));
    setTimeout(() => stepper.next());
  }

  onConfirm(): void {
    this.isConfirmed.set(true);
  }

  private generateSlots(date: Date): void {
    const slots: TimeSlot[] = [];
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    const end = new Date(date);
    end.setHours(21, 0, 0, 0);

    while (start < end) {
      const slotEnd = new Date(start.getTime() + 30 * 60000);
      const isBooked = Math.random() < 0.2;
      slots.push({
        start: new Date(start),
        end: slotEnd,
        isAvailable: !isBooked,
        isBlocked: false,
      });
      start.setTime(slotEnd.getTime());
    }

    this.availableSlots.set(slots);
  }
}

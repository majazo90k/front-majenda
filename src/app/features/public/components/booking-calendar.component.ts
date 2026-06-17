import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { NgFor, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [NgFor, DatePipe, MatIconModule, MatButtonModule],
  template: `
    <div class="calendar-wrap">
      <div class="cal-header">
        <button mat-icon-button (click)="prevMonth()"><mat-icon>chevron_left</mat-icon></button>
        <h3>{{ currentMonth() | date:'MMMM yyyy' }}</h3>
        <button mat-icon-button (click)="nextMonth()"><mat-icon>chevron_right</mat-icon></button>
      </div>
      <div class="cal-weekdays">
        <span *ngFor="let day of weekDays">{{ day }}</span>
      </div>
      <div class="cal-grid">
        <button *ngFor="let day of days()" class="cal-cell"
          [class.empty]="!day"
          [class.today]="isToday(day)"
          [class.selected]="isSelected(day)"
          [class.available]="day && isAvailable(day)"
          [class.unavailable]="day && !isAvailable(day)"
          (click)="selectDay(day)"
          [disabled]="!day || !isAvailable(day)">
          {{ day ? (day | date:'d') : '' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .calendar-wrap {
      max-width: 420px;
      margin: 0 auto;
    }
    .cal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .cal-header h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
      text-transform: capitalize;
    }
    .cal-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-weight: 600;
      color: #64748b;
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 3px;
    }
    .cal-cell {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.15s;
    }
    .cal-cell.empty { cursor: default; }
    .cal-cell.today { font-weight: 700; border: 2px solid #6366f1; }
    .cal-cell.selected { background: #6366f1; color: #fff; font-weight: 700; }
    .cal-cell.available { color: #1e293b; }
    .cal-cell.available:hover { background: #eef2ff; }
    .cal-cell.unavailable { color: #cbd5e1; cursor: not-allowed; }

    @media (max-width: 600px) {
      .calendar-wrap { max-width: 100%; }
      .cal-header h3 { font-size: 1rem; }
      .cal-cell { font-size: 0.8rem; }
      .cal-weekdays { font-size: 0.75rem; }
    }
  `],
})
export class BookingCalendarComponent {
  @Input() selectedDate: Date | null = null;
  @Output() dateSelected = new EventEmitter<Date>();

  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  viewDate = signal(new Date());

  currentMonth = computed(() => this.viewDate());

  days = computed(() => {
    const year = this.viewDate().getFullYear();
    const month = this.viewDate().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  });

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

  isToday(day: Date | null): boolean {
    if (!day) return false;
    const t = new Date();
    return day.getDate() === t.getDate() && day.getMonth() === t.getMonth() && day.getFullYear() === t.getFullYear();
  }

  isSelected(day: Date | null): boolean {
    if (!day || !this.selectedDate) return false;
    return day.getTime() === this.selectedDate.getTime();
  }

  isAvailable(day: Date | null): boolean {
    if (!day) return false;
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return day >= t && day.getDay() !== 0;
  }

  selectDay(day: Date | null): void {
    if (day && this.isAvailable(day)) this.dateSelected.emit(day);
  }
}

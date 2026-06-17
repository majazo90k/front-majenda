import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { WeekSchedule, DaySchedule, Holiday, BlockedRange } from '../models';

const DEFAULT_SCHEDULE: WeekSchedule = {
  0: { isWorkingDay: false, openTime: '00:00', closeTime: '00:00' },
  1: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
  2: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
  3: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
  4: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
  5: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
  6: { isWorkingDay: false, openTime: '00:00', closeTime: '00:00' },
};

export interface BusinessConfig {
  defaultSlotDuration: number;
  bufferBetweenSlots: number;
  schedule: WeekSchedule;
  holidays: Holiday[];
  blockedRanges: BlockedRange[];
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly config = signal<BusinessConfig>({
    defaultSlotDuration: 30,
    bufferBetweenSlots: 5,
    schedule: DEFAULT_SCHEDULE,
    holidays: [],
    blockedRanges: [],
  });

  readonly schedule = this.config.asReadonly();

  getConfig(): Observable<BusinessConfig> {
    return of(this.config()).pipe(delay(200));
  }

  updateSchedule(schedule: WeekSchedule): Observable<WeekSchedule> {
    this.config.update((c) => ({ ...c, schedule }));
    return of(schedule).pipe(delay(200));
  }

  updateGeneralSettings(settings: Partial<BusinessConfig>): Observable<BusinessConfig> {
    this.config.update((c) => ({ ...c, ...settings }));
    return of(this.config()).pipe(delay(200));
  }

  addHoliday(holiday: Holiday): Observable<Holiday> {
    this.config.update((c) => ({ ...c, holidays: [...c.holidays, holiday] }));
    return of(holiday).pipe(delay(200));
  }

  removeHoliday(id: string): Observable<boolean> {
    this.config.update((c) => ({
      ...c,
      holidays: c.holidays.filter((h) => h.id !== id),
    }));
    return of(true).pipe(delay(200));
  }
}

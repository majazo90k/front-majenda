import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Appointment, AppointmentStatus } from '../models';
import { MOCK_APPOINTMENTS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  getAll(): Observable<Appointment[]> {
    return of(MOCK_APPOINTMENTS).pipe(delay(300));
  }

  getByDate(date: string): Observable<Appointment[]> {
    const filtered = MOCK_APPOINTMENTS.filter(
      (a) => a.startTime.startsWith(date)
    );
    return of(filtered).pipe(delay(200));
  }

  getById(id: string): Observable<Appointment | undefined> {
    const found = MOCK_APPOINTMENTS.find((a) => a.id === id);
    return of(found).pipe(delay(150));
  }

  create(appointment: Omit<Appointment, 'id' | 'createdAt'>): Observable<Appointment> {
    const created: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    MOCK_APPOINTMENTS.push(created);
    return of(created).pipe(delay(300));
  }

  updateStatus(id: string, status: AppointmentStatus): Observable<Appointment | undefined> {
    const index = MOCK_APPOINTMENTS.findIndex((a) => a.id === id);
    if (index !== -1) {
      MOCK_APPOINTMENTS[index] = { ...MOCK_APPOINTMENTS[index], status };
      return of(MOCK_APPOINTMENTS[index]).pipe(delay(200));
    }
    return of(undefined).pipe(delay(200));
  }

  reschedule(id: string, startTime: string, endTime: string): Observable<Appointment | undefined> {
    const index = MOCK_APPOINTMENTS.findIndex((a) => a.id === id);
    if (index !== -1) {
      MOCK_APPOINTMENTS[index] = { ...MOCK_APPOINTMENTS[index], startTime, endTime };
      return of(MOCK_APPOINTMENTS[index]).pipe(delay(200));
    }
    return of(undefined).pipe(delay(200));
  }

  cancel(id: string): Observable<Appointment | undefined> {
    return this.updateStatus(id, 'cancelled');
  }
}

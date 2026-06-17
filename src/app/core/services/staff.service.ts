import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Staff } from '../models';
import { MOCK_STAFF } from './mock-data';

@Injectable({ providedIn: 'root' })
export class StaffService {
  getAll(): Observable<Staff[]> {
    return of(MOCK_STAFF).pipe(delay(200));
  }

  getById(id: string): Observable<Staff | undefined> {
    return of(MOCK_STAFF.find((s) => s.id === id)).pipe(delay(100));
  }

  create(staff: Omit<Staff, 'id'>): Observable<Staff> {
    const created: Staff = { ...staff, id: crypto.randomUUID() };
    MOCK_STAFF.push(created);
    return of(created).pipe(delay(300));
  }

  update(id: string, data: Partial<Staff>): Observable<Staff | undefined> {
    const index = MOCK_STAFF.findIndex((s) => s.id === id);
    if (index !== -1) {
      MOCK_STAFF[index] = { ...MOCK_STAFF[index], ...data };
      return of(MOCK_STAFF[index]).pipe(delay(200));
    }
    return of(undefined).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    const index = MOCK_STAFF.findIndex((s) => s.id === id);
    if (index !== -1) {
      MOCK_STAFF.splice(index, 1);
      return of(true).pipe(delay(200));
    }
    return of(false).pipe(delay(200));
  }
}

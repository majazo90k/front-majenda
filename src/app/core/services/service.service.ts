import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ServiceModel } from '../models';
import { MOCK_SERVICES } from './mock-data';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  getAll(): Observable<ServiceModel[]> {
    return of(MOCK_SERVICES).pipe(delay(200));
  }

  getActive(): Observable<ServiceModel[]> {
    return of(MOCK_SERVICES.filter((s) => s.isActive)).pipe(delay(200));
  }

  getById(id: string): Observable<ServiceModel | undefined> {
    return of(MOCK_SERVICES.find((s) => s.id === id)).pipe(delay(100));
  }

  create(service: Omit<ServiceModel, 'id'>): Observable<ServiceModel> {
    const created: ServiceModel = { ...service, id: crypto.randomUUID() };
    MOCK_SERVICES.push(created);
    return of(created).pipe(delay(300));
  }

  update(id: string, data: Partial<ServiceModel>): Observable<ServiceModel | undefined> {
    const index = MOCK_SERVICES.findIndex((s) => s.id === id);
    if (index !== -1) {
      MOCK_SERVICES[index] = { ...MOCK_SERVICES[index], ...data };
      return of(MOCK_SERVICES[index]).pipe(delay(200));
    }
    return of(undefined).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    const index = MOCK_SERVICES.findIndex((s) => s.id === id);
    if (index !== -1) {
      MOCK_SERVICES.splice(index, 1);
      return of(true).pipe(delay(200));
    }
    return of(false).pipe(delay(200));
  }
}

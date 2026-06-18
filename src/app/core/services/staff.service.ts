import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Staff, CreateStaffRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class StaffService {

  constructor(private api: ApiService) {}

  getAll(): Observable<Staff[]> {
    return this.api.get<Staff[]>('/staff');
  }

  getById(id: string): Observable<Staff> {
    return this.api.get<Staff>(`/staff/${id}`);
  }

  create(request: CreateStaffRequest): Observable<Staff> {
    return this.api.post<Staff>('/staff', request);
  }

  activate(id: string): Observable<Staff> {
    return this.api.patch<Staff>(`/staff/${id}/activate`, {});
  }

  deactivate(id: string): Observable<Staff> {
    return this.api.patch<Staff>(`/staff/${id}/deactivate`, {});
  }

  updateSchedule(id: string, schedule: Record<string, { open: string; close: string }[]>): Observable<Staff> {
    return this.api.patch<Staff>(`/staff/${id}/schedule`, schedule);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/staff/${id}`);
  }
}

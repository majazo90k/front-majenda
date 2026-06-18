import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Appointment, CreateAppointmentRequest, UpdateStatusRequest } from '../models';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  constructor(private api: ApiService) {}

  getAll(date?: string): Observable<Appointment[]> {
    const params = date ? new HttpParams().set('date', date) : undefined;
    return this.api.get<Appointment[]>('/appointments', params);
  }

  getById(id: string): Observable<Appointment> {
    return this.api.get<Appointment>(`/appointments/${id}`);
  }

  create(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.api.post<Appointment>('/appointments', request);
  }

  updateStatus(id: string, status: string): Observable<Appointment> {
    const body: UpdateStatusRequest = { status: status as any };
    return this.api.patch<Appointment>(`/appointments/${id}/status`, body);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/appointments/${id}`);
  }
}

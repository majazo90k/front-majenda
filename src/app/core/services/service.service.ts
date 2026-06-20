import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceModel, CreateServiceRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ServiceService {

  constructor(private api: ApiService) {}

  getAll(): Observable<ServiceModel[]> {
    return this.api.get<ServiceModel[]>('/services');
  }

  getActive(): Observable<ServiceModel[]> {
    return this.api.get<ServiceModel[]>('/services');
  }

  getById(id: string): Observable<ServiceModel> {
    return this.api.get<ServiceModel>(`/services/${id}`);
  }

  create(request: CreateServiceRequest): Observable<ServiceModel> {
    return this.api.post<ServiceModel>('/services', request);
  }

  update(id: string, request: CreateServiceRequest): Observable<ServiceModel> {
    return this.api.patch<ServiceModel>(`/services/${id}`, request);
  }

  activate(id: string): Observable<void> {
    return this.api.patch<void>(`/services/${id}/activate`, {});
  }

  deactivate(id: string): Observable<void> {
    return this.api.patch<void>(`/services/${id}/deactivate`, {});
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/services/${id}`);
  }
}

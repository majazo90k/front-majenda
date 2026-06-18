import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {

  constructor(private api: ApiService) {}

  getConfig(): Observable<any> {
    return this.api.get<any>('/config');
  }

  updateConfig(config: any): Observable<any> {
    return this.api.put<any>('/config', config);
  }
}

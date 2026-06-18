export type ServiceCategory = 'CORTE' | 'TINTURA' | 'PROMOCION';

export interface ServiceModel {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCLP: number;
  category: ServiceCategory;
  active: boolean;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  priceCLP: number;
  category: ServiceCategory;
}

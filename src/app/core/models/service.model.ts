export type ServiceCategory = 'corte' | 'tintura' | 'promocion';

export interface ServiceModel {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  isActive: boolean;
  category: ServiceCategory;
}

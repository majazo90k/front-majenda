import { Appointment, ServiceModel, Staff } from '../models';

export const MOCK_SERVICES: ServiceModel[] = [
  { id: 'srv-1', name: 'Corte de cabello', duration: 30, price: 10000, description: 'Corte clásico o moderno', isActive: true, category: 'corte' },
  { id: 'srv-2', name: 'Corte + Barba', duration: 45, price: 15000, description: 'Corte y arreglo de barba completo', isActive: true, category: 'promocion' },
  { id: 'srv-3', name: 'Arreglo de barba', duration: 20, price: 7000, description: 'Perfilado y arreglo de barba', isActive: true, category: 'corte' },
  { id: 'srv-4', name: 'Corte infantil', duration: 25, price: 8000, description: 'Corte para niños hasta 12 años', isActive: true, category: 'corte' },
  { id: 'srv-5', name: 'Tinte completo', duration: 120, price: 35000, description: 'Tinte de cabello completo', isActive: false, category: 'tintura' },
  { id: 'srv-6', name: 'Corte + Barba + Masaje', duration: 75, price: 25000, description: 'Pack completo de cuidado personal', isActive: true, category: 'promocion' },
  { id: 'srv-7', name: 'Corte + Lavado', duration: 50, price: 18000, description: 'Corte con lavado incluido', isActive: true, category: 'corte' },
  { id: 'srv-8', name: 'Mechas completas', duration: 150, price: 45000, description: 'Mechas para todo el cabello', isActive: true, category: 'tintura' },
  { id: 'srv-9', name: 'Botox capilar', duration: 90, price: 30000, description: 'Tratamiento reconstructor', isActive: true, category: 'tintura' },
];

export const MOCK_STAFF: Staff[] = [
  {
    id: 'stf-1',
    name: 'Carlos Muñoz',
    services: ['srv-1', 'srv-2', 'srv-3'],
    schedule: {
      0: { isWorkingDay: false, openTime: '00:00', closeTime: '00:00' },
      1: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
      2: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
      3: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
      4: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
      5: { isWorkingDay: true, openTime: '09:00', closeTime: '18:00' },
      6: { isWorkingDay: false, openTime: '00:00', closeTime: '00:00' },
    },
  },
  {
    id: 'stf-2',
    name: 'María González',
    services: ['srv-1', 'srv-3', 'srv-4'],
    schedule: {
      0: { isWorkingDay: false, openTime: '00:00', closeTime: '00:00' },
      1: { isWorkingDay: true, openTime: '10:00', closeTime: '19:00' },
      2: { isWorkingDay: true, openTime: '10:00', closeTime: '19:00' },
      3: { isWorkingDay: true, openTime: '10:00', closeTime: '19:00' },
      4: { isWorkingDay: true, openTime: '10:00', closeTime: '19:00' },
      5: { isWorkingDay: true, openTime: '10:00', closeTime: '19:00' },
      6: { isWorkingDay: true, openTime: '10:00', closeTime: '14:00' },
    },
  },
];

function addMinutes(dateStr: string, minutes: number): string {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

function makeDate(year: number, month: number, day: number, hour: number, min: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  const mi = String(min).padStart(2, '0');
  return `${year}-${m}-${d}T${h}:${mi}:00`;
}

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth() + 1;
const today = now.getDate();

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001', clientName: 'Juan Pérez', clientPhone: '+56 9 8765 4321', clientEmail: 'juan@example.com',
    serviceId: 'srv-1', staffId: 'stf-1', startTime: makeDate(y, m, today, 9, 0), endTime: makeDate(y, m, today, 9, 30),
    status: 'confirmed', notes: '', createdAt: makeDate(y, m, today, 8, 0),
  },
  {
    id: 'apt-002', clientName: 'Ana Martínez', clientPhone: '+56 9 7654 3210', clientEmail: 'ana@example.com',
    serviceId: 'srv-2', staffId: 'stf-1', startTime: makeDate(y, m, today, 10, 0), endTime: makeDate(y, m, today, 10, 45),
    status: 'pending', notes: 'Preferencia degradado', createdAt: makeDate(y, m, today, 8, 30),
  },
  {
    id: 'apt-003', clientName: 'Pedro Soto', clientPhone: '+56 9 6543 2109', clientEmail: 'pedro@example.com',
    serviceId: 'srv-1', staffId: 'stf-2', startTime: makeDate(y, m, today, 11, 0), endTime: makeDate(y, m, today, 11, 30),
    status: 'completed', notes: '', createdAt: makeDate(y, m, today - 1, 9, 0),
  },
  {
    id: 'apt-004', clientName: 'Laura Torres', clientPhone: '+56 9 5432 1098', clientEmail: 'laura@example.com',
    serviceId: 'srv-4', staffId: 'stf-2', startTime: makeDate(y, m, today, 14, 0), endTime: makeDate(y, m, today, 14, 25),
    status: 'cancelled', notes: 'Canceló por enfermedad', createdAt: makeDate(y, m, today - 2, 16, 0),
  },
  {
    id: 'apt-005', clientName: 'Diego Ramírez', clientPhone: '+56 9 4321 0987', clientEmail: 'diego@example.com',
    serviceId: 'srv-6', staffId: 'stf-1', startTime: makeDate(y, m, today, 15, 0), endTime: makeDate(y, m, today, 16, 15),
    status: 'completed', notes: '', createdAt: makeDate(y, m, today - 1, 10, 0),
  },
  {
    id: 'apt-006', clientName: 'Camila Vega', clientPhone: '+56 9 3210 9876', clientEmail: 'camila@example.com',
    serviceId: 'srv-8', staffId: 'stf-2', startTime: makeDate(y, m, today - 3, 10, 0), endTime: makeDate(y, m, today - 3, 12, 30),
    status: 'completed', notes: '', createdAt: makeDate(y, m, today - 4, 9, 0),
  },
  {
    id: 'apt-007', clientName: 'Felipe Muñoz', clientPhone: '+56 9 2109 8765', clientEmail: 'felipe@example.com',
    serviceId: 'srv-3', staffId: 'stf-1', startTime: makeDate(y, m, today - 5, 16, 0), endTime: makeDate(y, m, today - 5, 16, 20),
    status: 'completed', notes: '', createdAt: makeDate(y, m, today - 6, 11, 0),
  },
  {
    id: 'apt-008', clientName: 'Sofía Lagos', clientPhone: '+56 9 1098 7654', clientEmail: 'sofia@example.com',
    serviceId: 'srv-7', staffId: 'stf-2', startTime: makeDate(y, m, today - 7, 12, 0), endTime: makeDate(y, m, today - 7, 12, 50),
    status: 'completed', notes: 'Cliente frecuente', createdAt: makeDate(y, m, today - 8, 10, 0),
  },
  {
    id: 'apt-009', clientName: 'Matías Rojas', clientPhone: '+56 9 0987 6543', clientEmail: 'matias@example.com',
    serviceId: 'srv-2', staffId: 'stf-1', startTime: makeDate(y, m, today - 10, 11, 0), endTime: makeDate(y, m, today - 10, 11, 45),
    status: 'completed', notes: '', createdAt: makeDate(y, m, today - 11, 8, 0),
  },
  {
    id: 'apt-010', clientName: 'Valentina Díaz', clientPhone: '+56 9 9876 5432', clientEmail: 'valentina@example.com',
    serviceId: 'srv-9', staffId: 'stf-2', startTime: makeDate(y, m, today - 14, 15, 0), endTime: makeDate(y, m, today - 14, 16, 30),
    status: 'completed', notes: '', createdAt: makeDate(y, m, today - 15, 14, 0),
  },
  {
    id: 'apt-011', clientName: 'Benjamín Castro', clientPhone: '+56 9 8765 4321', clientEmail: 'benja@example.com',
    serviceId: 'srv-1', staffId: 'stf-1', startTime: makeDate(y, m > 1 ? m - 1 : 12, 15, 10, 0), endTime: makeDate(y, m > 1 ? m - 1 : 12, 15, 10, 30),
    status: 'completed', notes: '', createdAt: makeDate(y, m > 1 ? m - 1 : 12, 14, 9, 0),
  },
  {
    id: 'apt-012', clientName: 'Isidora Parra', clientPhone: '+56 9 7654 3210', clientEmail: 'isi@example.com',
    serviceId: 'srv-5', staffId: 'stf-2', startTime: makeDate(y, m > 1 ? m - 1 : 12, 18, 9, 0), endTime: makeDate(y, m > 1 ? m - 1 : 12, 18, 11, 0),
    status: 'completed', notes: 'Tinte color cobrizo', createdAt: makeDate(y, m > 1 ? m - 1 : 12, 17, 8, 0),
  },
  {
    id: 'apt-013', clientName: 'Tomás Herrera', clientPhone: '+56 9 6543 2109', clientEmail: 'tomas@example.com',
    serviceId: 'srv-6', staffId: 'stf-1', startTime: makeDate(y, m > 1 ? m - 1 : 12, 22, 14, 0), endTime: makeDate(y, m > 1 ? m - 1 : 12, 22, 15, 15),
    status: 'confirmed', notes: '', createdAt: makeDate(y, m > 1 ? m - 1 : 12, 21, 12, 0),
  },
  {
    id: 'apt-014', clientName: 'Emilia Torres', clientPhone: '+56 9 5432 1098', clientEmail: 'emi@example.com',
    serviceId: 'srv-4', staffId: 'stf-2', startTime: makeDate(y, m > 1 ? m - 1 : 12, 25, 11, 0), endTime: makeDate(y, m > 1 ? m - 1 : 12, 25, 11, 25),
    status: 'cancelled', notes: 'Se enfermó el niño', createdAt: makeDate(y, m > 1 ? m - 1 : 12, 24, 16, 0),
  },
  {
    id: 'apt-015', clientName: 'Gabriel Soto', clientPhone: '+56 9 4321 0987', clientEmail: 'gabriel@example.com',
    serviceId: 'srv-1', staffId: 'stf-1', startTime: makeDate(y, m > 1 ? m - 1 : 12, 28, 17, 0), endTime: makeDate(y, m > 1 ? m - 1 : 12, 28, 17, 30),
    status: 'completed', notes: '', createdAt: makeDate(y, m > 1 ? m - 1 : 12, 27, 15, 0),
  },
  {
    id: 'apt-016', clientName: 'Antonia Bravo', clientPhone: '+56 9 3210 9876', clientEmail: 'antonia@example.com',
    serviceId: 'srv-9', staffId: 'stf-2', startTime: makeDate(y, 1, 10, 10, 0), endTime: makeDate(y, 1, 10, 11, 30),
    status: 'completed', notes: '', createdAt: makeDate(y, 1, 9, 9, 0),
  },
  {
    id: 'apt-017', clientName: 'Sebastián Rivas', clientPhone: '+56 9 2109 8765', clientEmail: 'seba@example.com',
    serviceId: 'srv-2', staffId: 'stf-1', startTime: makeDate(y, 2, 5, 12, 0), endTime: makeDate(y, 2, 5, 12, 45),
    status: 'completed', notes: '', createdAt: makeDate(y, 2, 4, 10, 0),
  },
  {
    id: 'apt-018', clientName: 'Florencia Vega', clientPhone: '+56 9 1098 7654', clientEmail: 'flor@example.com',
    serviceId: 'srv-8', staffId: 'stf-2', startTime: makeDate(y, 3, 12, 9, 0), endTime: makeDate(y, 3, 12, 11, 30),
    status: 'completed', notes: 'Mechas balayage', createdAt: makeDate(y, 3, 11, 8, 0),
  },
  {
    id: 'apt-019', clientName: 'Nicolás Urzúa', clientPhone: '+56 9 0987 6543', clientEmail: 'nico@example.com',
    serviceId: 'srv-3', staffId: 'stf-1', startTime: makeDate(y, 4, 8, 15, 0), endTime: makeDate(y, 4, 8, 15, 20),
    status: 'confirmed', notes: '', createdAt: makeDate(y, 4, 7, 14, 0),
  },
  {
    id: 'apt-020', clientName: 'Constanza Muñoz', clientPhone: '+56 9 9876 5432', clientEmail: 'constanza@example.com',
    serviceId: 'srv-7', staffId: 'stf-2', startTime: makeDate(y, 5, 20, 16, 0), endTime: makeDate(y, 5, 20, 16, 50),
    status: 'completed', notes: '', createdAt: makeDate(y, 5, 19, 11, 0),
  },
  {
    id: 'apt-021', clientName: 'Cristóbal Pizarro', clientPhone: '+56 9 8765 4321', clientEmail: 'cristobal@example.com',
    serviceId: 'srv-1', staffId: 'stf-1', startTime: makeDate(y, 6, 3, 10, 0), endTime: makeDate(y, 6, 3, 10, 30),
    status: 'completed', notes: '', createdAt: makeDate(y, 6, 2, 9, 0),
  },
];

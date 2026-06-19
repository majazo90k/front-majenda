import { Appointment, ServiceModel, Staff } from '../models';

export const MOCK_SERVICES: ServiceModel[] = [
  { id: 'srv-1', name: 'Corte de cabello', durationMinutes: 30, priceCLP: 10000, description: 'Corte clásico o moderno', active: true, category: 'CORTE' },
  { id: 'srv-2', name: 'Corte + Barba', durationMinutes: 45, priceCLP: 15000, description: 'Corte y arreglo de barba completo', active: true, category: 'PROMOCION' },
  { id: 'srv-3', name: 'Arreglo de barba', durationMinutes: 20, priceCLP: 7000, description: 'Perfilado y arreglo de barba', active: true, category: 'CORTE' },
  { id: 'srv-4', name: 'Corte infantil', durationMinutes: 25, priceCLP: 8000, description: 'Corte para niños hasta 12 años', active: true, category: 'CORTE' },
  { id: 'srv-5', name: 'Tinte completo', durationMinutes: 120, priceCLP: 35000, description: 'Tinte de cabello completo', active: false, category: 'TINTURA' },
  { id: 'srv-6', name: 'Corte + Barba + Masaje', durationMinutes: 75, priceCLP: 25000, description: 'Pack completo de cuidado personal', active: true, category: 'PROMOCION' },
  { id: 'srv-7', name: 'Corte + Lavado', durationMinutes: 50, priceCLP: 18000, description: 'Corte con lavado incluido', active: true, category: 'CORTE' },
  { id: 'srv-8', name: 'Mechas completas', durationMinutes: 150, priceCLP: 45000, description: 'Mechas para todo el cabello', active: true, category: 'TINTURA' },
  { id: 'srv-9', name: 'Botox capilar', durationMinutes: 90, priceCLP: 30000, description: 'Tratamiento reconstructor', active: true, category: 'TINTURA' },
];

export const MOCK_STAFF: Staff[] = [
  { id: 'stf-1', name: 'Carlos Muñoz', email: 'carlos@negocio.cl', phone: '+56912345678', role: 'Barbero', active: true },
  { id: 'stf-2', name: 'María González', email: 'maria@negocio.cl', phone: '+56987654321', role: 'Estilista', active: true },
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

const SERVICE_NAMES: Record<string, string> = {
  'srv-1': 'Corte de cabello', 'srv-2': 'Corte + Barba', 'srv-3': 'Arreglo de barba',
  'srv-4': 'Corte infantil', 'srv-5': 'Tinte completo', 'srv-6': 'Corte + Barba + Masaje',
  'srv-7': 'Corte + Lavado', 'srv-8': 'Mechas completas', 'srv-9': 'Botox capilar',
};
const STAFF_NAMES: Record<string, string> = { 'stf-1': 'Carlos Muñoz', 'stf-2': 'María González' };

const RAW_APPOINTMENTS = [
  { id: 'apt-001', clientName: 'Juan Pérez', clientPhone: '+56 9 8765 4321', clientEmail: 'juan@example.com', serviceId: 'srv-1', staffId: 'stf-1', startTime: makeDate(y, m, today, 9, 0), endTime: makeDate(y, m, today, 9, 30), status: 'CONFIRMED' as const, notes: '', createdAt: makeDate(y, m, today, 8, 0) },
  { id: 'apt-002', clientName: 'Ana Martínez', clientPhone: '+56 9 7654 3210', clientEmail: 'ana@example.com', serviceId: 'srv-2', staffId: 'stf-1', startTime: makeDate(y, m, today, 10, 0), endTime: makeDate(y, m, today, 10, 45), status: 'PENDING' as const, notes: 'Preferencia degradado', createdAt: makeDate(y, m, today, 8, 30) },
  { id: 'apt-003', clientName: 'Pedro Soto', clientPhone: '+56 9 6543 2109', clientEmail: 'pedro@example.com', serviceId: 'srv-1', staffId: 'stf-2', startTime: makeDate(y, m, today, 11, 0), endTime: makeDate(y, m, today, 11, 30), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, m, today - 1, 9, 0) },
  { id: 'apt-004', clientName: 'Laura Torres', clientPhone: '+56 9 5432 1098', clientEmail: 'laura@example.com', serviceId: 'srv-4', staffId: 'stf-2', startTime: makeDate(y, m, today, 14, 0), endTime: makeDate(y, m, today, 14, 25), status: 'CANCELLED' as const, notes: 'Canceló por enfermedad', createdAt: makeDate(y, m, today - 2, 16, 0) },
  { id: 'apt-005', clientName: 'Diego Ramírez', clientPhone: '+56 9 4321 0987', clientEmail: 'diego@example.com', serviceId: 'srv-6', staffId: 'stf-1', startTime: makeDate(y, m, today, 15, 0), endTime: makeDate(y, m, today, 16, 15), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, m, today - 1, 10, 0) },
  { id: 'apt-006', clientName: 'Camila Vega', clientPhone: '+56 9 3210 9876', clientEmail: 'camila@example.com', serviceId: 'srv-8', staffId: 'stf-2', startTime: makeDate(y, m, today - 3, 10, 0), endTime: makeDate(y, m, today - 3, 12, 30), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, m, today - 4, 9, 0) },
  { id: 'apt-007', clientName: 'Felipe Muñoz', clientPhone: '+56 9 2109 8765', clientEmail: 'felipe@example.com', serviceId: 'srv-3', staffId: 'stf-1', startTime: makeDate(y, m, today - 5, 16, 0), endTime: makeDate(y, m, today - 5, 16, 20), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, m, today - 6, 11, 0) },
  { id: 'apt-008', clientName: 'Sofía Lagos', clientPhone: '+56 9 1098 7654', clientEmail: 'sofia@example.com', serviceId: 'srv-7', staffId: 'stf-2', startTime: makeDate(y, m, today - 7, 12, 0), endTime: makeDate(y, m, today - 7, 12, 50), status: 'COMPLETED' as const, notes: 'Cliente frecuente', createdAt: makeDate(y, m, today - 8, 10, 0) },
  { id: 'apt-009', clientName: 'Matías Rojas', clientPhone: '+56 9 0987 6543', clientEmail: 'matias@example.com', serviceId: 'srv-2', staffId: 'stf-1', startTime: makeDate(y, m, today - 10, 11, 0), endTime: makeDate(y, m, today - 10, 11, 45), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, m, today - 11, 8, 0) },
  { id: 'apt-010', clientName: 'Valentina Díaz', clientPhone: '+56 9 9876 5432', clientEmail: 'valentina@example.com', serviceId: 'srv-9', staffId: 'stf-2', startTime: makeDate(y, m, today - 14, 15, 0), endTime: makeDate(y, m, today - 14, 16, 30), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, m, today - 15, 14, 0) },
  { id: 'apt-011', clientName: 'Benjamín Castro', clientPhone: '+56 9 8765 4321', clientEmail: 'benja@example.com', serviceId: 'srv-1', staffId: 'stf-1', startTime: makeDate(y, m > 1 ? m - 1 : 12, 15, 10, 0), endTime: makeDate(y, m > 1 ? m - 1 : 12, 15, 10, 30), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, m > 1 ? m - 1 : 12, 14, 9, 0) },
  { id: 'apt-012', clientName: 'Isidora Parra', clientPhone: '+56 9 7654 3210', clientEmail: 'isi@example.com', serviceId: 'srv-5', staffId: 'stf-2', startTime: makeDate(y, m > 1 ? m - 1 : 12, 18, 9, 0), endTime: makeDate(y, m > 1 ? m - 1 : 12, 18, 11, 0), status: 'COMPLETED' as const, notes: 'Tinte color cobrizo', createdAt: makeDate(y, m > 1 ? m - 1 : 12, 17, 8, 0) },
  { id: 'apt-013', clientName: 'Tomás Herrera', clientPhone: '+56 9 6543 2109', clientEmail: 'tomas@example.com', serviceId: 'srv-6', staffId: 'stf-1', startTime: makeDate(y, m > 1 ? m - 1 : 12, 22, 14, 0), endTime: makeDate(y, m > 1 ? m - 1 : 12, 22, 15, 15), status: 'CONFIRMED' as const, notes: '', createdAt: makeDate(y, m > 1 ? m - 1 : 12, 21, 12, 0) },
  { id: 'apt-014', clientName: 'Emilia Torres', clientPhone: '+56 9 5432 1098', clientEmail: 'emi@example.com', serviceId: 'srv-4', staffId: 'stf-2', startTime: makeDate(y, m > 1 ? m - 1 : 12, 25, 11, 0), endTime: makeDate(y, m > 1 ? m - 1 : 12, 25, 11, 25), status: 'CANCELLED' as const, notes: 'Se enfermó el niño', createdAt: makeDate(y, m > 1 ? m - 1 : 12, 24, 16, 0) },
  { id: 'apt-015', clientName: 'Gabriel Soto', clientPhone: '+56 9 4321 0987', clientEmail: 'gabriel@example.com', serviceId: 'srv-1', staffId: 'stf-1', startTime: makeDate(y, m > 1 ? m - 1 : 12, 28, 17, 0), endTime: makeDate(y, m > 1 ? m - 1 : 12, 28, 17, 30), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, m > 1 ? m - 1 : 12, 27, 15, 0) },
  { id: 'apt-016', clientName: 'Antonia Bravo', clientPhone: '+56 9 3210 9876', clientEmail: 'antonia@example.com', serviceId: 'srv-9', staffId: 'stf-2', startTime: makeDate(y, 1, 10, 10, 0), endTime: makeDate(y, 1, 10, 11, 30), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, 1, 9, 9, 0) },
  { id: 'apt-017', clientName: 'Sebastián Rivas', clientPhone: '+56 9 2109 8765', clientEmail: 'seba@example.com', serviceId: 'srv-2', staffId: 'stf-1', startTime: makeDate(y, 2, 5, 12, 0), endTime: makeDate(y, 2, 5, 12, 45), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, 2, 4, 10, 0) },
  { id: 'apt-018', clientName: 'Florencia Vega', clientPhone: '+56 9 1098 7654', clientEmail: 'flor@example.com', serviceId: 'srv-8', staffId: 'stf-2', startTime: makeDate(y, 3, 12, 9, 0), endTime: makeDate(y, 3, 12, 11, 30), status: 'COMPLETED' as const, notes: 'Mechas balayage', createdAt: makeDate(y, 3, 11, 8, 0) },
  { id: 'apt-019', clientName: 'Nicolás Urzúa', clientPhone: '+56 9 0987 6543', clientEmail: 'nico@example.com', serviceId: 'srv-3', staffId: 'stf-1', startTime: makeDate(y, 4, 8, 15, 0), endTime: makeDate(y, 4, 8, 15, 20), status: 'CONFIRMED' as const, notes: '', createdAt: makeDate(y, 4, 7, 14, 0) },
  { id: 'apt-020', clientName: 'Constanza Muñoz', clientPhone: '+56 9 9876 5432', clientEmail: 'constanza@example.com', serviceId: 'srv-7', staffId: 'stf-2', startTime: makeDate(y, 5, 20, 16, 0), endTime: makeDate(y, 5, 20, 16, 50), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, 5, 19, 11, 0) },
  { id: 'apt-021', clientName: 'Cristóbal Pizarro', clientPhone: '+56 9 8765 4321', clientEmail: 'cristobal@example.com', serviceId: 'srv-1', staffId: 'stf-1', startTime: makeDate(y, 6, 3, 10, 0), endTime: makeDate(y, 6, 3, 10, 30), status: 'COMPLETED' as const, notes: '', createdAt: makeDate(y, 6, 2, 9, 0) },
];

export const MOCK_APPOINTMENTS: Appointment[] = RAW_APPOINTMENTS.map((a) => ({
  ...a,
  serviceName: SERVICE_NAMES[a.serviceId] || a.serviceId,
  staffName: STAFF_NAMES[a.staffId] || a.staffId,
}));

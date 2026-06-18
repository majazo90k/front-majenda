export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  staffId: string;
  serviceName: string;
  staffName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  staffId: string;
  startTime: string;
  notes?: string;
}

export interface UpdateStatusRequest {
  status: AppointmentStatus;
}

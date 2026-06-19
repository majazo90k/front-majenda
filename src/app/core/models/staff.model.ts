export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  schedule?: Record<string, { start: string; end: string }[]>;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  phone: string;
  role: string;
}

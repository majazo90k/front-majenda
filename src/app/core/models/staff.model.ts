export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export type UserRole = 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessName: string;
}

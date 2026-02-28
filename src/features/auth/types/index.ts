export interface LoginRequest {
  email: string;
  password: string;
}

export type UserRole = 'ADMIN' | 'OWNER' | 'INVESTOR' | 'EXECUTIVE';

export interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type UserRole = 'ADMIN' | 'OWNER' | 'INVESTOR' | 'EXECUTIVE';

export interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, string[]>;
}

// Organization types
export interface OrganizationDTO {
  id: number;
  name: string;
}

export * from './register';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, string[]>;
}

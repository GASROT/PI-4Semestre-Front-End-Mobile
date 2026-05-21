export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthUser {
  id?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  user: AuthUser;
}

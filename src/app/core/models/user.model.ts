export enum Role {
  CLIENT = 'CLIENT',
  DEPOT = 'DEPOT',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  nom: string;
  telephone?: string;
  adresse?: string | null;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

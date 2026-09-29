export type UserRole = 'ADMIN' | 'USER' | 'MANAGER' | 'GUEST';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BLOCKED';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  estado: UserStatus;
  telefono?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  nombre: string;
  email: string;
  password?: string;
  rol: UserRole;
  telefono?: string;
}

export interface UpdateUserDto {
  nombre?: string;
  email?: string;
  rol?: UserRole;
  estado?: UserStatus;
  telefono?: string;
}

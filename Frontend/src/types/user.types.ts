export type UserRole = 'ADMIN' | 'USER' | 'GUEST';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BLOCKED';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  estado: UserStatus;
  telefono?: string;
  avatarUrl?: string;
  terapeutaId?: string | null;
  especialidad?: string | null;
  cedulaProfesional?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  nombre: string;
  email: string;
  password?: string;
  rol: UserRole;
  telefono?: string;
  avatarUrl?: string;
  especialidad?: string;
  cedulaProfesional?: string;
  enfoqueClinico?: string;
}

export interface UpdateUserDto {
  nombre?: string;
  email?: string;
  rol?: UserRole;
  estado?: UserStatus;
  telefono?: string;
}

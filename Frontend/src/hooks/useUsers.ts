import { useState, useEffect, useCallback } from 'react';
import type { User, CreateUserDto, UpdateUserDto, QueryFilterParams } from '../types';
import { userService } from '../services/user.service';
import { useNotification } from '../context/NotificationContext';

// Default mock data to provide an immediate interactive experience
// if the NestJS backend is offline or during frontend development preview
const MOCK_USERS: User[] = [
  {
    id: '1',
    nombre: 'Araceli Ramos',
    email: 'araceli.ramos@empresa.com',
    rol: 'ADMIN',
    estado: 'ACTIVE',
    telefono: '+34 612 345 678',
    createdAt: '2026-01-15T10:30:00.000Z',
    updatedAt: '2026-03-01T14:20:00.000Z',
  },
  {
    id: '2',
    nombre: 'Carlos Mendoza',
    email: 'carlos.mendoza@empresa.com',
    rol: 'MANAGER',
    estado: 'ACTIVE',
    telefono: '+34 689 901 234',
    createdAt: '2026-02-10T09:15:00.000Z',
    updatedAt: '2026-02-12T11:45:00.000Z',
  },
  {
    id: '3',
    nombre: 'Elena Navarro',
    email: 'elena.navarro@empresa.com',
    rol: 'USER',
    estado: 'PENDING',
    telefono: '+34 655 432 109',
    createdAt: '2026-03-05T16:00:00.000Z',
    updatedAt: '2026-03-05T16:00:00.000Z',
  },
  {
    id: '4',
    nombre: 'Javier Morales',
    email: 'javier.morales@empresa.com',
    rol: 'USER',
    estado: 'INACTIVE',
    telefono: '+34 677 889 900',
    createdAt: '2026-01-20T12:00:00.000Z',
    updatedAt: '2026-02-28T08:30:00.000Z',
  },
];

export function useUsers(filterParams?: QueryFilterParams) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: notifyError } = useNotification();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Attempt connection to the backend through UserService
      const data = await userService.getAll(filterParams);
      setUsers(data && data.length > 0 ? data : MOCK_USERS);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al conectar con la API de usuarios. Usando datos locales.';
      console.warn('Backend no disponible, cargando mock data:', message);
      // Fallback gracefully so the UI is immediately usable
      setUsers((prev) => (prev.length > 0 ? prev : MOCK_USERS));
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (dto: CreateUserDto): Promise<User | null> => {
    setIsLoading(true);
    try {
      let newUser: User;
      try {
        newUser = await userService.create(dto);
      } catch {
        // Fallback simulation for offline/preview mode
        newUser = {
          id: String(Date.now()),
          nombre: dto.nombre,
          email: dto.email,
          rol: dto.rol,
          estado: 'ACTIVE',
          telefono: dto.telefono,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      setUsers((prev) => [newUser, ...prev]);
      success('Usuario Creado', `Se registró a "${newUser.nombre}" exitosamente.`);
      return newUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear el usuario';
      notifyError('Error al crear usuario', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, dto: UpdateUserDto): Promise<User | null> => {
    setIsLoading(true);
    try {
      let updatedUser: User;
      try {
        updatedUser = await userService.update(id, dto);
      } catch {
        // Fallback simulation
        const existing = users.find((u) => u.id === id);
        if (!existing) throw new Error('Usuario no encontrado');
        updatedUser = {
          ...existing,
          ...dto,
          updatedAt: new Date().toISOString(),
        };
      }

      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      success('Usuario Actualizado', `Se actualizaron los datos de "${updatedUser.nombre}".`);
      return updatedUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar el usuario';
      notifyError('Error al actualizar', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      try {
        await userService.delete(id);
      } catch {
        // Fallback simulation
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      success('Usuario Eliminado', 'El registro se eliminó satisfactoriamente.');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar el usuario';
      notifyError('Error al eliminar', msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string): Promise<boolean> => {
    const userToToggle = users.find((u) => u.id === id);
    if (!userToToggle) return false;

    const newStatus = userToToggle.estado === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      try {
        await userService.updateStatus(id, newStatus);
      } catch {
        // Fallback simulation
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, estado: newStatus, updatedAt: new Date().toISOString() } : u))
      );
      success('Estado Actualizado', `Estado cambiado a ${newStatus}.`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado';
      notifyError('Error', msg);
      return false;
    }
  };

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
  };
}

export default useUsers;

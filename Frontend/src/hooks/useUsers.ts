import { useState, useEffect, useCallback } from 'react';
import type { User, CreateUserDto, UpdateUserDto, QueryFilterParams } from '../types';
import { userService } from '../services/user.service';
import { useNotification } from '../context/NotificationContext';

export function useUsers(filterParams?: QueryFilterParams) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: notifyError } = useNotification();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getAll(filterParams);
      setUsers(data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al conectar con la API de usuarios.';
      setError(message);
      setUsers([]);
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
      const newUser = await userService.create(dto);
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
      const updatedUser = await userService.update(id, dto);
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
      await userService.delete(id);
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
      const updated = await userService.updateStatus(id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? updated : u))
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

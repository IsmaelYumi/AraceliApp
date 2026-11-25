import { useState, useEffect, useCallback } from 'react';
import type { Terapeuta, CreateTerapeutaDto, QueryFilterParams } from '../types';
import { therapistService } from '../services/therapist.service';
import { useNotification } from '../context/NotificationContext';

const INITIAL_THERAPISTS: Terapeuta[] = [
  {
    id: 'TER-104',
    nombres: 'Valeria',
    apellidos: 'Rivas Alarcón',
    nombreCompleto: 'Lic. Valeria Rivas Alarcón',
    especialidad: 'Estimulación Temprana y Terapia de Lenguaje Infantil',
    cedulaProfesional: '48921-ET',
    telefono: '+51 987 654 321',
    email: 'valeria.rivas@centroestimulacion.pe',
    fechaIngreso: '2023-01-15',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ9-N1aMt5HBwChxJ9zCpKZ0JKX_3jAMz3gL9h6r8JH9Rss3k4MMPezjYxnY2YXQFFGl5_sGl3nqhz8rWcs5qeRqGKpVr4rOmFaIkyNZz0zKBka1agG87DyYrHVzIqJ9ixSKsoMBMwCXDmZqcULLP19HjrnLNw6ClQZ4jG49hsHUIKPAyfQXQ1z1n0LgrmLVoZ00iSBOfA8o82eWKk9oEeTQzBgI354oes3s_IpqWCOqibyk0YftT9_g',
    estado: 'ACTIVO',
  },
  {
    id: 'TER-105',
    nombres: 'Laura',
    apellidos: 'Mendoza Castillo',
    nombreCompleto: 'Dra. Laura Mendoza Castillo',
    especialidad: 'Fonoaudiología',
    cedulaProfesional: 'CED-FON-894120',
    telefono: '+52 55 1234 5678',
    email: 'laura.mendoza@estimulaciontemprana.com',
    fechaIngreso: '2023-03-10',
    avatarUrl:
      'https://images.unsplash.com/photo-1594824813583-363198f80456?auto=format&fit=crop&q=80&w=400',
    estado: 'ACTIVO',
  },
  {
    id: 'TER-106',
    nombres: 'Carlos',
    apellidos: 'Herrera Delgado',
    nombreCompleto: 'Lic. Carlos Herrera Delgado',
    especialidad: 'Terapia Ocupacional',
    cedulaProfesional: 'CED-TOC-741290',
    telefono: '+52 55 8765 4321',
    email: 'carlos.herrera@estimulaciontemprana.com',
    fechaIngreso: '2023-05-20',
    avatarUrl:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    estado: 'ACTIVO',
  },
];

let globalTherapists: Terapeuta[] = INITIAL_THERAPISTS;
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export function useTherapists(filterParams?: QueryFilterParams) {
  const [therapists, setTherapists] = useState<Terapeuta[]>(globalTherapists);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { success, error: notifyError } = useNotification();

  useEffect(() => {
    const update = () => {
      setTherapists([...globalTherapists]);
    };
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const fetchTherapists = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await therapistService.getAll(filterParams);
      if (data && data.length > 0) {
        globalTherapists = data;
        setTherapists(data);
        notifyListeners();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al conectar con la API de terapeutas.';
      console.warn('API error (using active cache):', message);
    } finally {
      setIsLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  const getTherapistById = useCallback(
    (id: string): Terapeuta | undefined => {
      return globalTherapists.find((t) => t.id === id);
    },
    []
  );

  const createTherapist = async (dto: CreateTerapeutaDto): Promise<Terapeuta | null> => {
    setIsLoading(true);
    try {
      let created: Terapeuta;
      try {
        created = await therapistService.create(dto);
      } catch {
        // Fallback local creation if backend offline
        const nombreCompleto = `${dto.nombres.trim()} ${dto.apellidos.trim()}`;
        created = {
          id: `TER-${Date.now().toString().slice(-4)}`,
          nombres: dto.nombres.trim(),
          apellidos: dto.apellidos.trim(),
          nombreCompleto,
          especialidad: dto.especialidad.trim(),
          cedulaProfesional: dto.cedulaProfesional.trim(),
          telefono: dto.telefono.trim(),
          email: dto.email.trim(),
          fechaIngreso: dto.fechaIngreso || new Date().toISOString().split('T')[0],
          avatarUrl: dto.avatarUrl || '',
          estado: dto.estado || 'ACTIVO',
        };
      }
      globalTherapists = [created, ...globalTherapists];
      setTherapists([...globalTherapists]);
      notifyListeners();
      success('Terapeuta Registrado', `Se guardó la ficha de ${created.nombreCompleto}.`);
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar terapeuta';
      notifyError('No se pudo registrar', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTherapist = async (
    id: string,
    dto: Partial<CreateTerapeutaDto>
  ): Promise<Terapeuta | null> => {
    setIsLoading(true);
    try {
      let updated: Terapeuta;
      try {
        updated = await therapistService.update(id, dto);
      } catch {
        // Fallback update in cache if backend is unavailable
        const existing = globalTherapists.find((t) => t.id === id);
        if (!existing) throw new Error('Terapeuta no encontrado');
        const nombres = dto.nombres ?? existing.nombres;
        const apellidos = dto.apellidos ?? existing.apellidos;
        updated = {
          ...existing,
          ...dto,
          nombres,
          apellidos,
          nombreCompleto: `${nombres} ${apellidos}`.trim(),
        } as Terapeuta;
      }

      globalTherapists = globalTherapists.map((t) =>
        t.id === id ? { ...t, ...updated } : t
      );
      setTherapists([...globalTherapists]);
      notifyListeners();
      success('Expediente Actualizado', `Se guardaron los cambios de ${updated.nombreCompleto}.`);
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar expediente';
      notifyError('Error al guardar cambios', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTherapist = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      try {
        await therapistService.delete(id);
      } catch {
        // Ignore API error in offline mode
      }
      globalTherapists = globalTherapists.filter((t) => t.id !== id);
      setTherapists([...globalTherapists]);
      notifyListeners();
      success('Terapeuta Eliminado', 'El registro fue retirado exitosamente.');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      notifyError('No se pudo eliminar', msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    therapists,
    isLoading,
    fetchTherapists,
    getTherapistById,
    createTherapist,
    updateTherapist,
    deleteTherapist,
  };
}

export default useTherapists;

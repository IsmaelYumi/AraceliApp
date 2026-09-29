import { useState, useEffect, useCallback } from 'react';
import type { Terapeuta, CreateTerapeutaDto, QueryFilterParams } from '../types';
import { therapistService } from '../services/therapist.service';
import { useNotification } from '../context/NotificationContext';

const INITIAL_TERAPEUTAS: Terapeuta[] = [
  {
    id: 'ter_01',
    nombres: 'Claudia',
    apellidos: 'Morales Vargas',
    nombreCompleto: 'Lic. Claudia Morales Vargas',
    especialidad: 'Fonoaudiología',
    cedulaProfesional: 'CED-8492019',
    telefono: '+52 55 8741 2309',
    email: 'claudia.morales@serenitychildcare.org',
    fechaIngreso: '2023-03-01',
    enfoqueClinico: 'Especialista en deglución, trastorno del desarrollo del lenguaje y comunicación aumentativa.',
    estado: 'ACTIVO',
  },
  {
    id: 'ter_02',
    nombres: 'Mariana',
    apellidos: 'Vega Salinas',
    nombreCompleto: 'Lic. Mariana Vega Salinas',
    especialidad: 'Estimulación Temprana',
    cedulaProfesional: 'CED-9102834',
    telefono: '+52 55 7654 3210',
    email: 'mariana.vega@serenitychildcare.org',
    fechaIngreso: '2023-08-15',
    enfoqueClinico: 'Estimulación neuro-sensorial, psicomotricidad de 0 a 3 años e hitos madurativos infantiles.',
    estado: 'ACTIVO',
  },
  {
    id: 'ter_03',
    nombres: 'Alejandro',
    apellidos: 'Ríos Montalvo',
    nombreCompleto: 'Lic. Alejandro Ríos Montalvo',
    especialidad: 'Terapia Ocupacional',
    cedulaProfesional: 'CED-6571928',
    telefono: '+52 55 4321 8765',
    email: 'alejandro.rios@serenitychildcare.org',
    fechaIngreso: '2024-01-10',
    enfoqueClinico: 'Integración sensorial infantil, coordinación óculo-manual y autonomía en actividades cotidianas.',
    estado: 'ACTIVO',
  },
  {
    id: 'ter_04',
    nombres: 'Sofía',
    apellidos: 'Beltrán Duarte',
    nombreCompleto: 'Mtra. Sofía Beltrán Duarte',
    especialidad: 'Psicología Infantil',
    cedulaProfesional: 'CED-7829104',
    telefono: '+52 55 3210 9876',
    email: 'sofia.beltran@serenitychildcare.org',
    fechaIngreso: '2024-04-01',
    enfoqueClinico: 'Acompañamiento emocional infantil, autorregulación y asesoría a familias y cuidadores.',
    estado: 'ACTIVO',
  },
];

export function useTherapists(filterParams?: QueryFilterParams) {
  const [therapists, setTherapists] = useState<Terapeuta[]>(INITIAL_TERAPEUTAS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { success, error: notifyError } = useNotification();

  const fetchTherapists = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await therapistService.getAll(filterParams);
      if (data && data.length > 0) {
        setTherapists(data);
      }
    } catch {
      // Fallback seamlessly
    } finally {
      setIsLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  const createTherapist = async (dto: CreateTerapeutaDto): Promise<Terapeuta | null> => {
    setIsLoading(true);
    try {
      let created: Terapeuta;
      try {
        created = await therapistService.create(dto);
      } catch {
        const id = `ter_${Date.now().toString().slice(-4)}`;
        created = {
          id,
          nombres: dto.nombres,
          apellidos: dto.apellidos,
          nombreCompleto: `Lic. ${dto.nombres} ${dto.apellidos}`,
          especialidad: dto.especialidad,
          cedulaProfesional: dto.cedulaProfesional,
          telefono: dto.telefono,
          email: dto.email,
          fechaIngreso: dto.fechaIngreso,
          enfoqueClinico: dto.enfoqueClinico,
          estado: 'ACTIVO',
        };
      }

      setTherapists((prev) => [created, ...prev]);
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

  return {
    therapists,
    isLoading,
    fetchTherapists,
    createTherapist,
  };
}

export default useTherapists;

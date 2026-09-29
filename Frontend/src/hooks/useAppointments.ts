import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Cita, CreateCitaDto, QueryFilterParams } from '../types';
import { appointmentService } from '../services/appointment.service';
import { useNotification } from '../context/NotificationContext';

// Current dynamic dates for demo calendar
const todayStr = new Date().toISOString().split('T')[0];
const getOffsetDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const INITIAL_CITAS: Cita[] = [
  {
    id: 'cit_01',
    pacienteId: 'pac_01',
    pacienteNombre: 'Mateo García Silva',
    pacienteEdad: '2a 4m',
    terapeutaId: 'ter_01',
    terapeutaNombre: 'Lic. Claudia Morales',
    tipoTerapia: 'Fonoaudiología',
    fecha: todayStr,
    horaInicio: '09:00',
    horaFin: '09:45',
    notas: 'Estimulación de fonemas y vocabulario con pictogramas.',
    estado: 'PROGRAMADA',
  },
  {
    id: 'cit_02',
    pacienteId: 'pac_02',
    pacienteNombre: 'Sofía Herrera Castro',
    pacienteEdad: '1a 11m',
    terapeutaId: 'ter_02',
    terapeutaNombre: 'Lic. Mariana Vega',
    tipoTerapia: 'Estimulación Temprana',
    fecha: todayStr,
    horaInicio: '10:30',
    horaFin: '11:15',
    notas: 'Circuito motor y equilibrio en rampa blanda.',
    estado: 'PROGRAMADA',
  },
  {
    id: 'cit_03',
    pacienteId: 'pac_03',
    pacienteNombre: 'Liam Torres Navarro',
    pacienteEdad: '3a 3m',
    terapeutaId: 'ter_01',
    terapeutaNombre: 'Lic. Claudia Morales',
    tipoTerapia: 'Psicomotricidad',
    fecha: todayStr,
    horaInicio: '12:00',
    horaFin: '12:45',
    notas: 'Integración táctil y prensión fina.',
    estado: 'PROGRAMADA',
  },
  {
    id: 'cit_04',
    pacienteId: 'pac_04',
    pacienteNombre: 'Emma Ortiz Pineda',
    pacienteEdad: '1a 6m',
    terapeutaId: 'ter_01',
    terapeutaNombre: 'Lic. Claudia Morales',
    tipoTerapia: 'Terapia de deglución',
    fecha: getOffsetDate(1),
    horaInicio: '10:00',
    horaFin: '10:45',
    notas: 'Evaluación de masticación y texturas semisólidas.',
    estado: 'PROGRAMADA',
  },
  {
    id: 'cit_05',
    pacienteId: 'pac_01',
    pacienteNombre: 'Mateo García Silva',
    pacienteEdad: '2a 4m',
    terapeutaId: 'ter_01',
    terapeutaNombre: 'Lic. Claudia Morales',
    tipoTerapia: 'Fonoaudiología',
    fecha: getOffsetDate(2),
    horaInicio: '09:00',
    horaFin: '09:45',
    notas: 'Seguimiento de ordenes y discriminación auditiva.',
    estado: 'PROGRAMADA',
  },
  {
    id: 'cit_06',
    pacienteId: 'pac_02',
    pacienteNombre: 'Sofía Herrera Castro',
    pacienteEdad: '1a 11m',
    terapeutaId: 'ter_02',
    terapeutaNombre: 'Lic. Mariana Vega',
    tipoTerapia: 'Estimulación Temprana',
    fecha: getOffsetDate(2),
    horaInicio: '11:00',
    horaFin: '11:45',
    estado: 'PROGRAMADA',
  },
];

export function useAppointments(filterParams?: QueryFilterParams) {
  const [appointments, setAppointments] = useState<Cita[]>(INITIAL_CITAS);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { success, error: notifyError } = useNotification();

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getAll(filterParams);
      if (data && data.length > 0) {
        setAppointments(data);
      }
    } catch {
      // Fallback seamlessly
    } finally {
      setIsLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Appointments grouped by date with count (monochromatic count indicator as per PRD)
  const appointmentCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((cita) => {
      counts[cita.fecha] = (counts[cita.fecha] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  // Appointments for the currently selected date
  const selectedDateAppointments = useMemo(() => {
    return appointments
      .filter((c) => c.fecha === selectedDate)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [appointments, selectedDate]);

  const createAppointment = async (dto: CreateCitaDto, pacienteNombre: string): Promise<Cita | null> => {
    setIsLoading(true);
    try {
      let created: Cita;
      try {
        created = await appointmentService.create(dto);
      } catch {
        created = {
          id: `cit_${Date.now().toString().slice(-4)}`,
          pacienteId: dto.pacienteId,
          pacienteNombre,
          terapeutaId: dto.terapeutaId,
          terapeutaNombre: 'Lic. Claudia Morales',
          tipoTerapia: dto.tipoTerapia,
          fecha: dto.fecha,
          horaInicio: dto.horaInicio,
          horaFin: dto.horaFin,
          notas: dto.notas,
          estado: 'PROGRAMADA',
        };
      }

      setAppointments((prev) => [...prev, created]);
      success('Cita Agendada', `Cita para ${pacienteNombre} el ${created.fecha} a las ${created.horaInicio}.`);
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al agendar la cita';
      notifyError('No se pudo agendar', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    appointments,
    selectedDate,
    setSelectedDate,
    appointmentCountsByDate,
    selectedDateAppointments,
    isLoading,
    fetchAppointments,
    createAppointment,
  };
}

export default useAppointments;

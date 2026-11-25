import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Cita, CreateCitaDto, FilterCitaDto } from '../types';
import { appointmentService } from '../services/appointment.service';
import { useNotification } from '../context/NotificationContext';

const todayStr = new Date().toISOString().split('T')[0];

export function useAppointments(filterParams?: FilterCitaDto) {
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error: notifyError } = useNotification();

  const filterParamsKey = JSON.stringify(filterParams);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getAll(filterParams);
      // Ensure date format is YYYY-MM-DD
      const formatted = (data || []).map((c) => ({
        ...c,
        fecha: c.fecha ? c.fecha.split('T')[0] : todayStr,
      }));
      setAppointments(formatted);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al conectar con la API de citas.';
      console.warn('API error:', message);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParamsKey]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Appointments grouped by date with count (monochromatic count indicator as per PRD)
  const appointmentCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((cita) => {
      const key = cita.fecha ? cita.fecha.split('T')[0] : '';
      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [appointments]);

  // Appointments for the currently selected date
  const selectedDateAppointments = useMemo(() => {
    return appointments
      .filter((c) => c.fecha === selectedDate || c.fecha?.startsWith(selectedDate))
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [appointments, selectedDate]);

  const createAppointment = async (dto: CreateCitaDto, pacienteNombre: string): Promise<Cita | null> => {
    setIsLoading(true);
    try {
      const created = await appointmentService.create(dto);
      const normalizedCreated: Cita = {
        ...created,
        pacienteNombre: created.pacienteNombre || pacienteNombre,
        fecha: created.fecha ? created.fecha.split('T')[0] : dto.fecha,
      };
      setAppointments((prev) => [...prev, normalizedCreated]);
      success(
        'Cita Agendada',
        `Cita para ${pacienteNombre} el ${normalizedCreated.fecha} a las ${normalizedCreated.horaInicio}.`
      );
      return normalizedCreated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al agendar la cita';
      notifyError('No se pudo agendar', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, estado: Cita['estado']): Promise<boolean> => {
    try {
      await appointmentService.updateStatus(id, estado);
      setAppointments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado } : c))
      );
      success(
        'Estado Actualizado',
        `La cita ha sido marcada como ${estado === 'COMPLETADA' ? 'completada' : estado === 'CANCELADA' ? 'cancelada' : 'programada'}.`
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar estado de la cita';
      notifyError('No se pudo actualizar', msg);
      return false;
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      await appointmentService.delete(id);
      setAppointments((prev) => prev.filter((c) => c.id !== id));
      success('Cita Eliminada', 'La cita se eliminó del calendario.');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la cita';
      notifyError('No se pudo eliminar', msg);
      return false;
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
    updateAppointmentStatus,
    deleteAppointment,
  };
}

export default useAppointments;

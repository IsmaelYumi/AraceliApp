import React, { useState, useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  Clock,
  Plus,
  MoreVertical,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Avatar } from '../../components/common/Avatar';
import { usePatients } from '../../hooks/usePatients';
import { useAppointments } from '../../hooks/useAppointments';
import { useModal } from '../../hooks/useModal';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import type { CreateActividadDto, FilterCitaDto } from '../../types';

export interface TherapistDashboardProps {
  onNavigateToPatients: () => void;
  onNavigateToAppointments: () => void;
  onSelectPatient: (patientId: string) => void;
}

export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  onNavigateToAppointments,
  onSelectPatient,
}) => {
  const { user } = useAuth();
  const { patients, activities, addActivity, isLoading } = usePatients();

  const terapeutaId = user?.terapeutaId || authService.getStoredAuth().user?.terapeutaId;

  // Filtro explícito FilterCitaDto con el ID del terapeuta
  const appointmentsFilter = useMemo<FilterCitaDto | undefined>(() => {
    if (user?.rol !== 'ADMIN' && terapeutaId) {
      return { terapeutaId };
    }
    return undefined;
  }, [user?.rol, terapeutaId]);

  const { appointments } = useAppointments(appointmentsFilter);
  const newSessionModal = useModal<void>();
  const userName = user?.nombre || authService.getStoredAuth().user?.nombre || 'Especialista';
  const userAvatar = user?.avatarUrl || authService.getStoredAuth().user?.avatarUrl;

  // Citas exclusivas del terapeuta
  const myAppointments = useMemo(() => {
    if (user?.rol !== 'ADMIN' && terapeutaId) {
      return appointments.filter((c) => !c.terapeutaId || c.terapeutaId === terapeutaId);
    }
    return appointments;
  }, [appointments, terapeutaId, user?.rol]);

  // Próximas citas ordenadas cronológicamente:
  // Solo citas que aún NO llegan a la fecha (estrictamente futuras a hoy) y que NO estén completadas ni canceladas
  const proximasCitas = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    return myAppointments
      .filter((c) => {
        const fechaCita = c.fecha ? c.fecha.split('T')[0] : '';
        // Solo citas que aún NO llegan a la fecha (posteriores al día de hoy)
        const noLlegoAFecha = fechaCita > today;
        // Solo citas programadas (si ya llegó a la fecha o está completada/cancelada, no se muestra)
        const esProgramada = c.estado === 'PROGRAMADA';

        return noLlegoAFecha && esProgramada;
      })
      .sort((a, b) => {
        const d = a.fecha.localeCompare(b.fecha);
        return d !== 0 ? d : a.horaInicio.localeCompare(b.horaInicio);
      });
  }, [myAppointments]);

  // State for new session modal
  const [sessionForm, setSessionForm] = useState<CreateActividadDto>({
    pacienteId: patients[0]?.id || '',
    titulo: '',
    numeroProceso: 'PROC-01',
    duracionMinutos: 45,
    descripcion: '',
    observaciones: '',
  });

  // Cálculo automático del proceso incremental para el paciente seleccionado
  const nextSessionProcessNumber = useMemo(() => {
    const patientActs = activities.filter((a) => a.pacienteId === sessionForm.pacienteId);
    let maxNum = patientActs.length;
    for (const act of patientActs) {
      const match = act.numeroProceso?.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    return `PROC-${String(maxNum + 1).padStart(2, '0')}`;
  }, [activities, sessionForm.pacienteId]);

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.titulo.trim() || !sessionForm.descripcion.trim() || !sessionForm.pacienteId) return;

    const payload: CreateActividadDto = {
      ...sessionForm,
      numeroProceso: nextSessionProcessNumber,
      terapeutaId: user?.terapeutaId || undefined,
      terapeutaNombre: user?.nombre || undefined,
      especialidad: user?.especialidad || undefined,
    };

    const created = await addActivity(payload);
    if (created) {
      newSessionModal.close();
      setSessionForm({
        pacienteId: patients[0]?.id || '',
        titulo: '',
        numeroProceso: '',
        duracionMinutos: 45,
        descripcion: '',
        observaciones: '',
      });
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-4">
          <Avatar
            src={userAvatar}
            alt={userName}
            size="lg"
            rounded="2xl"
            className="shadow-sm border border-slate-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Hola, {userName}
              </h1>
              {user?.especialidad && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {user.especialidad}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Aquí está el resumen de tu actividad clínica de hoy en tiempo real.
            </p>
          </div>
        </div>

        <button
          onClick={() => newSessionModal.open()}
          disabled={patients.length === 0}
          className="bg-[#0f5b89] hover:bg-[#0c4c73] text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-medium shadow-sm transition-all active:scale-[0.98] cursor-pointer w-fit disabled:opacity-50"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Nueva Sesión</span>
        </button>
      </div>

      {/* 3 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Pacientes Activos */}
        <Card className="p-5 shadow-soft-sm flex items-center gap-4 border-none bg-white">
          <div className="w-12 h-12 rounded-full bg-[#5ba4e0] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pacientes Clínicos</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">{patients.length}</span>
              <span className="text-xs font-semibold text-[#3b87be]">en seguimiento</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Citas Agendadas */}
        <Card className="p-5 shadow-soft-sm flex items-center gap-4 border-none bg-white">
          <div className="w-12 h-12 rounded-full bg-[#a3e9b8] text-[#166534] flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Próximas Citas</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">{proximasCitas.length}</span>
              <span className="text-xs font-semibold text-[#2d7f4f]">por llegar</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Evoluciones Clínicas */}
        <Card className="p-5 shadow-soft-sm flex items-center gap-4 border-none bg-white">
          <div className="w-12 h-12 rounded-full bg-[#b096fb] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Evoluciones / Sesiones</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">{activities.length}</span>
              <span className="text-xs font-semibold text-[#7c3aed]">registradas</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Próximas Citas Card */}
      <Card className="p-6 max-w-2xl shadow-soft-sm border-none bg-white">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Mis Próximas Citas</h2>
            <p className="text-xs text-slate-500 mt-0.5">Citas que aún no llegan a la fecha</p>
          </div>
          <button
            onClick={onNavigateToAppointments}
            className="text-xs font-semibold text-[#488bc2] hover:text-[#316e9f] transition-colors cursor-pointer"
          >
            Ver calendario completo
          </button>
        </div>

        {/* Appointment Items */}
        {proximasCitas.length > 0 ? (
          <div className="space-y-4">
            {proximasCitas.slice(0, 5).map((cita) => (
              <div
                key={cita.id}
                onClick={() => onSelectPatient(cita.pacienteId)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Avatar
                    src={cita.pacienteAvatar}
                    alt={cita.pacienteNombre}
                    size="sm"
                    rounded="full"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {cita.pacienteNombre}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {cita.horaInicio} - {cita.horaFin} ({cita.fecha})
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  aria-label="Opciones de cita"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPatient(cita.pacienteId);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 mb-2">No hay próximas citas pendientes cuya fecha esté por llegar.</p>
            <button
              onClick={onNavigateToAppointments}
              className="text-xs font-bold text-primary hover:underline"
            >
              Ir al calendario para ver la agenda completa
            </button>
          </div>
        )}
      </Card>

      {/* Modal for Nueva Sesión */}
      <Modal
        isOpen={newSessionModal.isOpen}
        onClose={newSessionModal.close}
        size="md"
        title="Nueva Sesión Terapéutica"
        description="Registra la intervención y evolución del paciente infantil"
        footer={
          <>
            <Button variant="secondary" onClick={newSessionModal.close}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSessionSubmit}
              isLoading={isLoading}
            >
              Guardar Sesión
            </Button>
          </>
        }
      >
        <form onSubmit={handleSessionSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Paciente</label>
            <select
              value={sessionForm.pacienteId}
              onChange={(e) => setSessionForm({ ...sessionForm, pacienteId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 outline-none focus:border-serenity-500 cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombreCompleto} ({p.codigoExpediente})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Título de la Sesión"
            placeholder="Ej. Terapia de Juego y Estimulación Sensorio-Motriz"
            required
            value={sessionForm.titulo}
            onChange={(e) => setSessionForm({ ...sessionForm, titulo: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Desempeño y Observaciones Clínicas
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe los avances, hitos motores o comunicativos logrados..."
              value={sessionForm.descripcion}
              onChange={(e) => setSessionForm({ ...sessionForm, descripcion: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-serenity-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TherapistDashboard;

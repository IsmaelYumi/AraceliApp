import React, { useState } from 'react';
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
import { usePatients } from '../../hooks/usePatients';
import { useModal } from '../../hooks/useModal';
import type { CreateActividadDto } from '../../types';

export interface TherapistDashboardProps {
  onNavigateToPatients: () => void;
  onNavigateToAppointments: () => void;
  onSelectPatient: (patientId: string) => void;
}

export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  onNavigateToAppointments,
  onSelectPatient,
}) => {
  const { patients, addActivity, isLoading } = usePatients();
  const newSessionModal = useModal<void>();

  // State for new session modal
  const [sessionForm, setSessionForm] = useState<CreateActividadDto>({
    pacienteId: patients[0]?.id || 'pac_01',
    titulo: '',
    numeroProceso: 'PROC-10',
    duracionMinutos: 45,
    descripcion: '',
    observaciones: '',
  });

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.titulo.trim() || !sessionForm.descripcion.trim()) return;

    const created = await addActivity(sessionForm);
    if (created) {
      newSessionModal.close();
      setSessionForm({
        pacienteId: patients[0]?.id || 'pac_01',
        titulo: '',
        numeroProceso: 'PROC-11',
        duracionMinutos: 45,
        descripcion: '',
        observaciones: '',
      });
    }
  };

  // Static list matching the exact screenshot items
  const upcomingAppointments = [
    {
      id: 'cit_1',
      patientId: 'pac_01',
      name: 'Mateo R.',
      time: '10:00 AM',
      therapy: 'Terapia de Juego',
      avatarUrl:
        'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'cit_2',
      patientId: 'pac_02',
      name: 'Lucía F.',
      time: '11:30 AM',
      therapy: 'Evaluación Inicial',
      avatarUrl:
        'https://images.unsplash.com/photo-1517677129300-07b130802f46?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'cit_3',
      patientId: 'pac_03',
      name: 'Diego V.',
      time: '02:00 PM',
      therapy: 'Seguimiento Conductual',
      avatarUrl:
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Top Header matching reference screen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Hola, Dr. García
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aquí está el resumen de tu actividad de hoy.
          </p>
        </div>

        <button
          onClick={() => newSessionModal.open()}
          className="bg-[#0f5b89] hover:bg-[#0c4c73] text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-medium shadow-sm transition-all active:scale-[0.98] cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Nueva Sesión</span>
        </button>
      </div>

      {/* 3 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Total de Sesiones */}
        <Card className="p-5 shadow-soft-sm flex items-center gap-4 border-none bg-white">
          <div className="w-12 h-12 rounded-full bg-[#5ba4e0] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total de Sesiones</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">48</span>
              <span className="text-xs font-semibold text-[#3b87be]">esta semana</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Progreso General */}
        <Card className="p-5 shadow-soft-sm flex items-center gap-4 border-none bg-white">
          <div className="w-12 h-12 rounded-full bg-[#a3e9b8] text-[#166534] flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Progreso General</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">85%</span>
              <span className="text-xs font-semibold text-[#2d7f4f]">objetivos</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Tiempo en Terapia */}
        <Card className="p-5 shadow-soft-sm flex items-center gap-4 border-none bg-white">
          <div className="w-12 h-12 rounded-full bg-[#b096fb] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tiempo en Terapia</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">120h</span>
              <span className="text-xs font-semibold text-[#7c3aed]">acumuladas</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Próximas Citas Card matching screenshot */}
      <Card className="p-6 max-w-2xl shadow-soft-sm border-none bg-white">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900">Próximas Citas</h2>
          <button
            onClick={onNavigateToAppointments}
            className="text-xs font-semibold text-[#488bc2] hover:text-[#316e9f] transition-colors cursor-pointer"
          >
            Ver calendario
          </button>
        </div>

        {/* Appointment Items */}
        <div className="space-y-4">
          {upcomingAppointments.map((cita) => (
            <div
              key={cita.id}
              onClick={() => onSelectPatient(cita.patientId)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={cita.avatarUrl}
                  alt={cita.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shadow-sm shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {cita.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {cita.time} - {cita.therapy}
                    </span>
                  </div>
                </div>
              </div>

              <button
                aria-label="Opciones de cita"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPatient(cita.patientId);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
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

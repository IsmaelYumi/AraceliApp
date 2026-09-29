import React, { useState } from 'react';
import { usePatients } from '../../hooks/usePatients';
import { useModal } from '../../hooks/useModal';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import type { CreateActividadDto } from '../../types';

export interface PatientDetailProps {
  patientId: string;
  onBack: () => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ patientId, onBack }) => {
  const { getPatientById, getPatientActivities, addActivity, isLoading } = usePatients();
  const patient = getPatientById(patientId);
  const activities = getPatientActivities(patientId);
  const activityModal = useModal<void>();

  const [activityForm, setActivityForm] = useState<CreateActividadDto>({
    pacienteId: patientId,
    titulo: '',
    numeroProceso: `PROC-0${activities.length + 1}`,
    duracionMinutos: 45,
    descripcion: '',
    observaciones: '',
  });

  if (!patient) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-[48px] text-outline mx-auto mb-3 block">
          folder_off
        </span>
        <h3 className="text-lg font-bold text-on-surface">Paciente no encontrado</h3>
        <p className="text-sm text-on-surface-variant mt-1">El expediente solicitado no está disponible.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold"
        >
          Volver a Pacientes
        </button>
      </div>
    );
  }

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.titulo.trim() || !activityForm.descripcion.trim()) return;

    const created = await addActivity(activityForm);
    if (created) {
      activityModal.close();
      setActivityForm({
        pacienteId: patientId,
        titulo: '',
        numeroProceso: `PROC-0${activities.length + 2}`,
        duracionMinutos: 45,
        descripcion: '',
        observaciones: '',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Back and New Activity action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Volver a Directorio de Pacientes</span>
        </button>

        <button
          onClick={() => activityModal.open()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary shadow-sm hover:opacity-95 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Nueva Actividad Clínica</span>
        </button>
      </div>

      {/* Patient Header Card matching main_html.html */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1543332164-6e82f355badc?w=120&auto=format&fit=crop&q=80"
              alt={patient.nombreCompleto}
              className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-primary-container shrink-0"
            />

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-md bg-primary-fixed">
                  {patient.codigoExpediente}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-fixed text-on-secondary-fixed">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Tratamiento Activo
                </span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface tracking-tight">
                {patient.nombreCompleto}
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Edad: <strong className="text-on-surface">{patient.edadTexto}</strong> • Fecha Nacimiento:{' '}
                {formatDate(patient.fechaNacimiento)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 md:items-end text-xs text-on-surface-variant pt-4 md:pt-0 border-t md:border-t-0 border-surface-container">
            <span>
              Ingreso: <strong className="text-on-surface">{formatDate(patient.fechaIngreso)}</strong>
            </span>
            <span>
              Especialista: <strong className="text-primary">{patient.terapeutaPrincipal || 'Dra. Sofía Mendoza'}</strong>
            </span>
          </div>
        </div>

        {/* Clinical details grid matching main_html.html */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-surface-container">
          {/* Diagnóstico */}
          <div className="p-4 rounded-xl bg-surface-container-low flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">neurology</span>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-outline block">
                Diagnóstico Principal
              </span>
              <p className="text-xs font-bold text-on-surface mt-0.5">{patient.diagnosticoPrincipal}</p>
            </div>
          </div>

          {/* Tutor Legal */}
          <div className="p-4 rounded-xl bg-surface-container-low flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">family_restroom</span>
            <div className="text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-outline block">
                Tutor Legal
              </span>
              <p className="font-bold text-on-surface mt-0.5">
                {patient.tutor.nombreCompleto} ({patient.tutor.parentesco})
              </p>
              <p className="text-on-surface-variant mt-0.5">{patient.tutor.telefono}</p>
            </div>
          </div>

          {/* Ubicación / Ambiente from main_html.html */}
          <div className="p-4 rounded-xl bg-surface-container-low flex items-start gap-3">
            <span className="material-symbols-outlined text-tertiary text-[22px] shrink-0 mt-0.5">meeting_room</span>
            <div className="text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-outline block">
                Ubicación / Ambiente
              </span>
              <p className="font-bold text-on-surface mt-0.5">Sala 2</p>
              <p className="text-on-surface-variant">Estimulación Sensorial y Fonética</p>
            </div>
          </div>
        </div>

        {/* Observaciones Clínicas de Ingreso from main_html.html */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-outline">
            Observaciones Clínicas de Ingreso
          </h4>
          <div className="p-4 bg-surface rounded-xl border border-surface-container">
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Niño colaborador y sociable. Muestra notable entusiasmo frente a estímulos lúdicos manipulativos y pictogramas visuales interactivos. Evidencia mayor dificultad en la articulación del fonema vibrante <span className="font-semibold text-on-surface">/r/</span>, omisiones en grupos consonánticos complejos y reto en la estructuración de enunciados de más de 3 palabras sin apoyo gráfico.
            </p>
          </div>
        </div>
      </div>

      {/* Historial Clínico Longitudinal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-surface tracking-tight">
              Historial Clínico Longitudinal
            </h3>
            <p className="text-xs text-on-surface-variant">
              Línea de tiempo de intervenciones y notas de evolución del paciente
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
            {activities.length} Intervenciones
          </span>
        </div>

        <div className="space-y-4">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-primary-fixed text-on-primary-fixed">
                    {act.numeroProceso}
                  </span>
                  <h4 className="font-bold text-sm text-on-surface">{act.titulo}</h4>
                </div>

                <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {act.duracionMinutos} min
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {formatDate(act.fecha)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-primary font-medium">
                Especialista: {act.terapeutaNombre} ({act.especialidad})
              </p>

              <div className="p-3.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface block mb-1">Desempeño y Proceso Clínico:</strong>
                {act.descripcion}
              </div>

              {act.observaciones && (
                <div className="text-xs text-on-surface-variant">
                  <strong className="text-on-surface">Observaciones: </strong>
                  {act.observaciones}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nueva Actividad */}
      <Modal
        isOpen={activityModal.isOpen}
        onClose={activityModal.close}
        size="lg"
        title="Registrar Nueva Actividad Clínica"
        description={`Expediente: ${patient.codigoExpediente} — ${patient.nombreCompleto}`}
        footer={
          <>
            <Button variant="secondary" onClick={activityModal.close}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleActivitySubmit}
              isLoading={isLoading}
            >
              Guardar Actividad
            </Button>
          </>
        }
      >
        <form onSubmit={handleActivitySubmit} className="space-y-4">
          <Input
            label="Título de la Actividad / Proceso"
            placeholder="Ej. Discriminación auditiva y fonemas bilabiales"
            required
            value={activityForm.titulo}
            onChange={(e) => setActivityForm({ ...activityForm, titulo: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nº Proceso"
              required
              value={activityForm.numeroProceso}
              onChange={(e) => setActivityForm({ ...activityForm, numeroProceso: e.target.value })}
            />
            <Input
              label="Duración (minutos)"
              type="number"
              required
              value={activityForm.duracionMinutos}
              onChange={(e) => setActivityForm({ ...activityForm, duracionMinutos: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">
              Descripción del Desempeño
            </label>
            <textarea
              rows={4}
              required
              placeholder="Detalla las actividades realizadas y respuesta del paciente..."
              value={activityForm.descripcion}
              onChange={(e) => setActivityForm({ ...activityForm, descripcion: e.target.value })}
              className="w-full bg-surface-container-low p-3 rounded-xl text-xs text-on-surface outline-none focus:bg-surface-container-lowest"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientDetail;

import React, { useState, useMemo, useEffect } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/common/Avatar';
import type { CreateCitaDto } from '../../types';

function calculateEndTime(startTime: string, durationMinutes = 45): string {
  if (!startTime || !startTime.includes(':')) return '09:45';
  const [h, m] = startTime.split(':').map(Number);
  const totalMins = (h || 0) * 60 + (m || 0) + durationMinutes;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

export const AppointmentsCalendar: React.FC = () => {
  const { user } = useAuth();
  const {
    selectedDate,
    setSelectedDate,
    appointmentCountsByDate,
    selectedDateAppointments,
    appointments,
    createAppointment,
    updateAppointmentStatus,
  } = useAppointments();

  const { patients, isLoading: isLoadingPatients } = usePatients();

  // Form states
  const [horaInicio, setHoraInicio] = useState<string>('09:00');
  const [horaFin, setHoraFin] = useState<string>('09:45');
  const [notes, setNotes] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-calculate end time by default when start time changes
  const handleHoraInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHoraInicio(val);
    if (val) {
      setHoraFin(calculateEndTime(val, 45));
    }
  };

  const isTimeValid = useMemo(() => {
    if (!horaInicio || !horaFin) return false;
    return horaInicio < horaFin;
  }, [horaInicio, horaFin]);

  // Month navigation (iniciado con la fecha actual)
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
    currentMonthDate
  );

  // Auto-select first patient if none selected
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push({ dateStr: '', dayNum: 0, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = String(d).padStart(2, '0');
    const mStr = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const totalMonthAppointments = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return appointments.filter((c) => c.fecha?.startsWith(prefix)).length;
  }, [appointments, year, month]);

  const handleConfirmAppointment = async () => {
    if (!activePatient || !isTimeValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const dto: CreateCitaDto = {
        pacienteId: activePatient.id,
        terapeutaId: user?.terapeutaId || undefined,
        fecha: selectedDate,
        horaInicio,
        horaFin,
        notas: notes.trim() || undefined,
      };

      await createAppointment(dto, activePatient.nombreCompleto);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedSelectedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(selectedDate + 'T00:00:00'));

  return (
    <div className="flex flex-col w-full gap-8 pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
              Gestión de Consultas y Sesiones
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-secondary font-medium">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              Conectado a Base de Datos
            </span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">Agendar Citas</h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Gestiona la programación mensual de sesiones terapéuticas para los pacientes registrados en el centro.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Calendar + Right Booking Form */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ======================= Left Column (xl:col-span-7) ======================= */}
        <section className="xl:col-span-7 flex flex-col gap-6">
          {/* Calendar Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-6 border border-surface-container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-on-surface capitalize leading-tight">
                    {monthName}
                  </h2>
                  <span className="text-xs text-on-surface-variant">
                    {totalMonthAppointments} {totalMonthAppointments === 1 ? 'cita programada' : 'citas programadas'} este mes
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => {
                    const today = new Date();
                    setCurrentMonthDate(today);
                    setSelectedDate(today.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-medium shadow-sm cursor-pointer hover:bg-surface-container transition-colors"
                  type="button"
                >
                  Hoy
                </button>
                <div className="flex items-center">
                  <button
                    onClick={handlePrevMonth}
                    aria-label="Mes anterior"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <button
                    onClick={handleNextMonth}
                    aria-label="Mes siguiente"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-on-surface-variant py-2">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
              {days.map((d, idx) => {
                if (!d.isCurrentMonth) {
                  return (
                    <div
                      key={idx}
                      className="aspect-square p-2 rounded-xl bg-surface-container-low/40 opacity-40 flex flex-col justify-between cursor-not-allowed"
                    >
                      <span className="text-xs text-on-surface-variant text-right"></span>
                    </div>
                  );
                }

                const count = appointmentCountsByDate[d.dateStr] || 0;
                const isSelected = selectedDate === d.dateStr;

                if (isSelected) {
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(d.dateStr)}
                      className="aspect-square p-2 rounded-xl bg-primary-container text-on-primary-container shadow-md flex flex-col justify-between text-left relative overflow-hidden cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-primary-container">{d.dayNum}</span>
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                      </div>
                      <div className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-surface-container-lowest/90 text-primary self-start">
                        {count > 0 ? `${count} ${count === 1 ? 'cita' : 'citas'}` : 'Sin citas'}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(d.dateStr)}
                    className="aspect-square p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between text-left group cursor-pointer"
                    type="button"
                  >
                    <span className="text-xs font-medium text-on-surface">{d.dayNum}</span>
                    {count > 0 ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container-highest text-on-surface-variant self-start">
                        {count} {count === 1 ? 'cita' : 'citas'}
                      </span>
                    ) : (
                      <span className="h-3" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-on-surface-variant bg-surface-container-low/50 p-3.5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-surface-container-highest"></span>
                <span>Citas programadas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                <span className="font-semibold text-on-surface">Día seleccionado</span>
              </div>
            </div>
          </div>

          {/* Under Calendar: Citas ya programadas para este día */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-4 border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">view_timeline</span>
                <h3 className="text-base font-semibold text-on-surface">Citas ya programadas para este día</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-medium">
                {selectedDateAppointments.length} {selectedDateAppointments.length === 1 ? 'asignada' : 'asignadas'}
              </span>
            </div>

            {selectedDateAppointments.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-surface-container-low/50 border border-dashed border-surface-container text-on-surface-variant">
                <span className="material-symbols-outlined text-[36px] text-outline mb-2">event_available</span>
                <p className="text-sm font-semibold text-on-surface">No hay citas programadas para este día</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Usa el panel de la derecha para agendar una sesión terapéutica en esta fecha ({formattedSelectedDate}).
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {selectedDateAppointments.map((cita) => {
                  const isCompleted = cita.estado === 'COMPLETADA';
                  const isCancelled = cita.estado === 'CANCELADA';
                  const borderColor = isCompleted
                    ? 'border-l-secondary'
                    : isCancelled
                    ? 'border-l-error'
                    : 'border-l-primary';

                  return (
                    <div
                      key={cita.id}
                      className={`p-4 rounded-xl bg-surface-container-low flex flex-col justify-between gap-3 relative overflow-hidden border-l-4 ${borderColor} border border-surface-container`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            src={cita.pacienteAvatar}
                            alt={cita.pacienteNombre}
                            size="sm"
                            rounded="full"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-on-surface truncate">{cita.pacienteNombre}</span>
                              {cita.pacienteExpediente && (
                                <span className="text-[10px] text-on-primary-container bg-primary-fixed px-1.5 py-0.5 rounded font-mono">
                                  {cita.pacienteExpediente}
                                </span>
                              )}
                            </div>
                            {cita.terapeutaNombre && (
                              <p className="text-[10px] text-on-surface-variant truncate mt-0.5">
                                Terapeuta: <strong>{cita.terapeutaNombre}</strong>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-on-surface block">
                            {cita.horaInicio} - {cita.horaFin}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                              isCompleted
                                ? 'bg-secondary-container text-on-secondary-container'
                                : isCancelled
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-primary-fixed text-on-primary-fixed'
                            }`}
                          >
                            {isCompleted && <span className="material-symbols-outlined text-[12px]">check</span>}
                            {cita.estado}
                          </span>
                        </div>
                      </div>

                      {cita.notas && (
                        <p className="text-[11px] text-on-surface-variant italic bg-surface-container-lowest/80 p-2 rounded-lg border border-surface-container">
                          "{cita.notas}"
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-surface-container">
                        {cita.estado === 'PROGRAMADA' && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateAppointmentStatus(cita.id, 'COMPLETADA')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-secondary hover:bg-secondary-container/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Marcar como sesión completada"
                            >
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Completar
                            </button>
                            <button
                              type="button"
                              onClick={() => updateAppointmentStatus(cita.id, 'CANCELADA')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Cancelar cita"
                            >
                              <span className="material-symbols-outlined text-[14px]">cancel</span>
                              Cancelar
                            </button>
                          </>
                        )}
                        {cita.estado === 'CANCELADA' && (
                          <button
                            type="button"
                            onClick={() => updateAppointmentStatus(cita.id, 'PROGRAMADA')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary-fixed/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">replay</span>
                            Reactivar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ======================= Right Column (xl:col-span-5) ======================= */}
        <section className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-md space-y-6 border border-surface-container">
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-surface-container">
              <div>
                <span className="text-xs uppercase tracking-wider text-primary font-bold block">
                  Reserva de Sesión
                </span>
                <h2 className="text-lg font-bold text-on-surface mt-0.5 capitalize">
                  {formattedSelectedDate}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {selectedDateAppointments.length} citas en fecha
              </span>
            </div>

            {/* 1. Selecciona el Horario (Inicio y Fin) */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                <span>1. Horario de la Sesión</span>
                <span className="text-[11px] text-on-surface-variant font-normal">Hora de inicio y finalización</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-on-surface-variant font-medium block">Hora de inicio</span>
                  <div className="relative flex items-center">
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={handleHoraInicioChange}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface focus:border-primary focus:bg-surface-container-lowest outline-none transition-all cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-on-surface-variant font-medium block">Hora de finalización</span>
                  <div className="relative flex items-center">
                    <input
                      type="time"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl bg-surface-container-low border text-xs font-semibold text-on-surface focus:bg-surface-container-lowest outline-none transition-all cursor-pointer ${
                        !isTimeValid ? 'border-error text-error focus:border-error' : 'border-surface-container focus:border-primary'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {!isTimeValid && (
                <p className="text-[11px] text-error flex items-center gap-1 font-medium mt-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  La hora de inicio debe ser anterior a la hora de finalización.
                </p>
              )}
            </div>

            {/* 2. Paciente asignado (SOLO PACIENTES REGISTRADOS POR EL ADMINISTRADOR) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                <span>2. Paciente asignado</span>
                <span className="text-[11px] text-primary font-medium">
                  {patients.length} {patients.length === 1 ? 'paciente registrado' : 'pacientes registrados'}
                </span>
              </label>

              {isLoadingPatients ? (
                <div className="p-3 text-xs text-on-surface-variant text-center bg-surface-container-low rounded-xl">
                  Cargando directorio de pacientes...
                </div>
              ) : patients.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <span className="material-symbols-outlined text-[18px] text-amber-700">warning</span>
                    No hay pacientes registrados en el sistema
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    El administrador debe registrar pacientes en el módulo de Pacientes antes de que se puedan agendar citas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface font-semibold focus:border-primary focus:bg-surface-container-lowest outline-none transition-all cursor-pointer"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombreCompleto} — Exp: {p.codigoExpediente} {p.diagnosticoPrincipal ? `[${p.diagnosticoPrincipal}]` : ''}
                      </option>
                    ))}
                  </select>

                  {/* Ficha resumen del paciente seleccionado */}
                  {activePatient && (
                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-3">
                      <Avatar
                        src={activePatient.avatarUrl}
                        alt={activePatient.nombreCompleto}
                        size="md"
                        rounded="xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-on-surface truncate">
                          {activePatient.nombreCompleto}
                        </div>
                        <div className="text-[11px] text-on-surface-variant truncate">
                          {activePatient.edadTexto ? `${activePatient.edadTexto} • ` : ''}
                          Expediente: <strong className="text-on-surface font-mono">{activePatient.codigoExpediente}</strong>
                        </div>
                        {activePatient.diagnosticoPrincipal && (
                          <div className="text-[10px] text-primary truncate font-medium mt-0.5">
                            {activePatient.diagnosticoPrincipal}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Terapeuta Responsable (Vía Token / Sesión Activa) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface block">
                3. Terapeuta Responsable
              </label>
              <div className="p-3 rounded-xl bg-surface-container-low/70 border border-surface-container flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-medium">
                      Especialista en sesión
                    </span>
                    <span className="text-xs font-bold text-on-surface truncate block">
                      {user?.nombre || 'Especialista autenticado'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-secondary bg-secondary-container/60 px-2 py-0.5 rounded-full shrink-0">
                  Sesión vinculada
                </span>
              </div>
            </div>

            {/* 4. Notas breves u observaciones */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                <span>4. Notas breves u observaciones</span>
                <span className="text-[11px] text-on-surface-variant font-normal">Opcional</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Sesión de estimulación de lenguaje expresivo. Traer cuaderno de actividades..."
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 text-xs focus:bg-surface-container-lowest focus:outline-none focus:border-primary border border-surface-container transition-all resize-none"
              />
            </div>

            {/* Notification Banner */}
            {activePatient?.tutor && (
              <div className="p-3.5 rounded-xl bg-primary-fixed/30 border border-primary-fixed flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                  notifications_active
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  Aviso para el tutor <strong>{activePatient.tutor.nombreCompleto}</strong> ({activePatient.tutor.parentesco}
                  {activePatient.tutor.telefono ? ` • Tel: ${activePatient.tutor.telefono}` : ''}).
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={!activePatient || !isTimeValid || isSubmitting || patients.length === 0}
                onClick={handleConfirmAppointment}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSubmitting ? 'progress_activity' : 'done_all'}
                </span>
                {isSubmitting ? 'Agendando...' : 'Confirmar Cita'}
              </button>
              <button
                type="button"
                onClick={() => setNotes('')}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
              >
                Limpiar notas
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AppointmentsCalendar;

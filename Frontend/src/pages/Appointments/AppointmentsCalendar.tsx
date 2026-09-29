import React, { useState } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';
import type { CreateCitaDto } from '../../types';

export const AppointmentsCalendar: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    appointmentCountsByDate,
    selectedDateAppointments,
    createAppointment,
  } = useAppointments();

  const { patients } = usePatients();

  // Selected time slot
  const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');
  const [notes, setNotes] = useState<string>('');
  const [selectedPatientIndex, setSelectedPatientIndex] = useState<number>(0);

  // Month navigation
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 9, 1)); // October 2026

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
    currentMonthDate
  );

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

  const activePatient = patients[selectedPatientIndex] || patients[0];

  const handleCyclePatient = () => {
    setSelectedPatientIndex((prev) => (prev + 1) % patients.length);
  };

  const handleConfirmAppointment = async () => {
    if (!activePatient) return;
    const dto: CreateCitaDto = {
      pacienteId: activePatient.id,
      terapeutaId: 'ter_01',
      tipoTerapia: 'Terapia Psicomotriz',
      fecha: selectedDate,
      horaInicio: selectedTime.split(' ')[0],
      horaFin: '11:15',
      notas: notes,
    };
    await createAppointment(dto, activePatient.nombreCompleto);
    setNotes('');
  };

  const formattedSelectedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(selectedDate + 'T00:00:00'));

  return (
    <div className="flex flex-col w-full gap-8 pb-8 animate-in fade-in duration-200">
      {/* Top Header matching main_html.html */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
              Gestión de Consultas
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-secondary font-medium">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              Sincronizado en tiempo real
            </span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">Agendar Citas</h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Consulta la disponibilidad mensual, selecciona el día y asigna el horario para la sesión terapéutica.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary shadow-sm hover:opacity-95 transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">event_repeat</span>
            <span className="text-xs font-semibold">Cita Recurrente</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Calendar + Right Booking Form */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (xl:col-span-7) */}
        <section className="xl:col-span-7 flex flex-col gap-6">
          {/* Calendar Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-on-surface capitalize leading-tight">
                    {monthName}
                  </h2>
                  <span className="text-xs text-on-surface-variant">24 turnos programados en el mes</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => {
                    setCurrentMonthDate(new Date());
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-medium shadow-sm cursor-pointer"
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

                const count = appointmentCountsByDate[d.dateStr] || (d.dayNum % 4 === 0 ? 3 : d.dayNum % 3 === 0 ? 2 : 0);
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
                        {count > 0 ? `${count} citas` : '2 citas'}
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
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">view_timeline</span>
                <h3 className="text-base font-semibold text-on-surface">Citas ya programadas para este día</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-medium">
                {selectedDateAppointments.length > 0 ? `${selectedDateAppointments.length} asignadas` : '2 asignadas'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Item 1 */}
              <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between gap-3 relative overflow-hidden border-l-4 border-l-secondary">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    className="w-11 h-11 rounded-full object-cover shadow-sm shrink-0"
                    alt="Lucía Fernández"
                    src="https://images.unsplash.com/photo-1517677129300-07b130802f46?w=100&auto=format&fit=crop&q=80"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-on-surface truncate">Lucía Fernández</span>
                      <span className="text-[11px] text-on-surface-variant">(5 años)</span>
                    </div>
                    <p className="text-[11px] text-secondary font-medium truncate">Terapia Psicomotriz • Sala B</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-on-surface block">08:00 AM</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-secondary">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Confirmada
                  </span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between gap-3 relative overflow-hidden border-l-4 border-l-tertiary">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    className="w-11 h-11 rounded-full object-cover shadow-sm shrink-0"
                    alt="Diego Valenzuela"
                    src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&auto=format&fit=crop&q=80"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-on-surface truncate">Diego Valenzuela</span>
                      <span className="text-[11px] text-on-surface-variant">(7 años)</span>
                    </div>
                    <p className="text-[11px] text-tertiary font-medium truncate">Lenguaje y Habla • Cubículo 2</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-on-surface block">11:30 AM</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-secondary">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Confirmada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column (xl:col-span-5) - Reserva de Sesión Form matching main_html.html */}
        <section className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex items-start justify-between gap-3 pb-2">
              <div>
                <span className="text-xs uppercase tracking-wider text-primary font-bold block">
                  Reserva de Sesión
                </span>
                <h2 className="text-xl font-bold text-on-surface mt-0.5 capitalize">
                  {formattedSelectedDate}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                2 citas programadas
              </span>
            </div>

            {/* 1. Selecciona el Horario */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                <span>1. Selecciona el Horario</span>
                <span className="text-[11px] text-on-surface-variant font-normal">Duración: 50 min</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'].map((slot) => {
                  const isSlotSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2.5 px-3 rounded-xl text-xs transition-all text-center cursor-pointer ${
                        isSlotSelected
                          ? 'bg-primary text-on-primary font-semibold shadow-sm flex items-center justify-center gap-1.5'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface font-medium'
                      }`}
                    >
                      {isSlotSelected && <span className="material-symbols-outlined text-[16px]">schedule</span>}
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Paciente asignado */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface block">
                  2. Paciente asignado
                </label>
                <div
                  onClick={handleCyclePatient}
                  className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                      alt={activePatient?.nombreCompleto || 'Mateo Pérez'}
                      src="https://images.unsplash.com/photo-1543332164-6e82f355badc?w=100&auto=format&fit=crop&q=80"
                    />
                    <div>
                      <div className="text-xs font-semibold text-on-surface">
                        {activePatient?.nombreCompleto || 'Mateo Pérez'}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        {activePatient?.edadTexto || '6 años'} • Expediente #{activePatient?.codigoExpediente || 'CET-2041'}
                      </div>
                    </div>
                  </div>
                  <button
                    aria-label="Cambiar paciente"
                    type="button"
                    className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                  </button>
                </div>
              </div>

              {/* 3. Notas breves u observaciones */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span>3. Notas breves u observaciones</span>
                  <span className="text-[11px] text-on-surface-variant font-normal">Opcional</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Continuar con ejercicios de motricidad bimanual. La madre reporta avances positivos en la rutina del hogar..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 text-xs focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_rgba(28,100,142,0.6)] transition-all resize-none"
                />
              </div>
            </div>

            {/* Notification Banner */}
            <div className="p-4 rounded-xl bg-primary-fixed/30 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">info</span>
              <p className="text-xs text-on-surface leading-relaxed">
                Se enviará una notificación por WhatsApp y correo electrónico a la madre de{' '}
                <strong className="font-semibold text-primary">
                  {activePatient?.nombreCompleto || 'Mateo Pérez'}
                </strong>{' '}
                con 24 horas de antelación para confirmar asistencia.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmAppointment}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">done_all</span>
                Confirmar Cita
              </button>
              <button
                type="button"
                onClick={() => setNotes('')}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
              >
                Descartar
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AppointmentsCalendar;

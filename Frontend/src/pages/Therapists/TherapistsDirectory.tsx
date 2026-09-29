import React, { useState } from 'react';
import {
  Stethoscope,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useTherapists } from '../../hooks/useTherapists';
import { useModal } from '../../hooks/useModal';
import { formatDate } from '../../utils/formatters';
import type { CreateTerapeutaDto, EspecialidadTerapeutica } from '../../types';

export interface TherapistsDirectoryProps {
  onOpenRegister?: () => void;
}

export const TherapistsDirectory: React.FC<TherapistsDirectoryProps> = () => {
  const { therapists, isLoading, createTherapist } = useTherapists();
  const registerModal = useModal<void>();

  // Form state in 2 symmetric columns as specified in PRD
  const [formData, setFormData] = useState<CreateTerapeutaDto>({
    nombres: '',
    apellidos: '',
    cedulaProfesional: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    especialidad: 'Fonoaudiología',
    telefono: '',
    email: '',
    enfoqueClinico: '',
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.cedulaProfesional.trim()) return;

    const created = await createTherapist(formData);
    if (created) {
      registerModal.close();
      setFormData({
        nombres: '',
        apellidos: '',
        cedulaProfesional: '',
        fechaIngreso: new Date().toISOString().split('T')[0],
        especialidad: 'Fonoaudiología',
        telefono: '',
        email: '',
        enfoqueClinico: '',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-serenity-700">
              Módulo de Administración
            </span>
            <Badge variant="neutral" size="sm">
              {therapists.length} Especialistas
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Directorio de Terapeutas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fichas claras de especialistas sin saturación de métricas de ocupación.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => registerModal.open()}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Registrar Nuevo Terapeuta
        </Button>
      </div>

      {/* Therapists Cards Grid (PRD Section 4.4.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {therapists.map((terapeuta) => (
          <Card
            key={terapeuta.id}
            className="p-6 flex flex-col justify-between border-none shadow-soft-sm hover:shadow-soft-md transition-all"
          >
            <div>
              {/* Specialist Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-serenity-500 to-mint-400 text-white font-bold text-base flex items-center justify-center shadow-soft-sm shrink-0">
                    {terapeuta.nombres[0]}
                    {terapeuta.apellidos[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-800 leading-snug">
                      {terapeuta.nombreCompleto}
                    </h3>
                    <p className="text-xs font-semibold text-serenity-700 flex items-center gap-1.5 mt-0.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                      {terapeuta.especialidad}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Cédula: <strong className="text-slate-600 font-mono">{terapeuta.cedulaProfesional}</strong>
                    </span>
                  </div>
                </div>

                <Badge variant={terapeuta.estado === 'ACTIVO' ? 'success' : 'neutral'} size="sm" dot>
                  {terapeuta.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* Direct Contact Channels (PRD Section 4.4.3) */}
              <div className="p-4 rounded-2xl bg-slate-50 space-y-2 text-xs text-slate-600 mb-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Teléfono / WhatsApp: <strong className="text-slate-800 font-medium">{terapeuta.telefono}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Correo Corporativo: <strong className="text-slate-800 font-medium">{terapeuta.email}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Fecha de Ingreso: {formatDate(terapeuta.fechaIngreso)}</span>
                </div>
              </div>

              {terapeuta.enfoqueClinico && (
                <p className="text-xs text-slate-500 leading-relaxed px-1">
                  <strong className="text-slate-700 font-medium">Enfoque Clínico:</strong> {terapeuta.enfoqueClinico}
                </p>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Especialista Clínico Infantil</span>
              <span className="text-serenity-700 font-semibold">Ficha Profesional Activa</span>
            </div>
          </Card>
        ))}
      </div>

      {/* FORMULARIO DE REGISTRO EN 2 COLUMNAS SIMÉTRICAS (PRD Section 4.4.2) */}
      <Modal
        isOpen={registerModal.isOpen}
        onClose={registerModal.close}
        size="lg"
        title="Registrar Nuevo Terapeuta Especialista"
        description="Formulario simétrico de datos básicos, contacto y enfoque clínico"
        footer={
          <>
            <Button variant="secondary" onClick={registerModal.close}>
              Descartar
            </Button>
            <Button
              variant="primary"
              onClick={handleRegisterSubmit}
              isLoading={isLoading}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Guardar Ficha del Terapeuta
            </Button>
          </>
        }
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Columna 1 (Básica) */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-serenity-800 pb-1 border-b border-slate-100">
                Columna 1: Información Básica
              </h4>
              <Input
                label="Nombres"
                placeholder="Ej. Sofía"
                required
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              />
              <Input
                label="Apellidos"
                placeholder="Ej. Beltrán Duarte"
                required
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              />
              <Input
                label="Cédula Profesional"
                placeholder="Ej. CED-7829104"
                required
                value={formData.cedulaProfesional}
                onChange={(e) => setFormData({ ...formData, cedulaProfesional: e.target.value })}
              />
              <Input
                label="Fecha de Ingreso"
                type="date"
                required
                value={formData.fechaIngreso}
                onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
              />
            </div>

            {/* Columna 2 (Clínica y Contacto) */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-serenity-800 pb-1 border-b border-slate-100">
                Columna 2: Clínica y Contacto
              </h4>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Especialidad Principal</label>
                <select
                  value={formData.especialidad}
                  onChange={(e) =>
                    setFormData({ ...formData, especialidad: e.target.value as EspecialidadTerapeutica })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 outline-none focus:border-serenity-500 cursor-pointer"
                >
                  <option value="Fonoaudiología">Fonoaudiología</option>
                  <option value="Estimulación Temprana">Estimulación Temprana</option>
                  <option value="Terapia Ocupacional">Terapia Ocupacional</option>
                  <option value="Psicomotricidad">Psicomotricidad</option>
                  <option value="Psicología Infantil">Psicología Infantil</option>
                </select>
              </div>

              <Input
                label="Teléfono / WhatsApp"
                placeholder="+52 55 3210 9876"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
              <Input
                label="Correo Electrónico Corporativo"
                type="email"
                placeholder="especialista@serenitychildcare.org"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Notas sobre Enfoque Clínico"
                placeholder="Áreas de subespecialidad o metodología terapéutica..."
                value={formData.enfoqueClinico || ''}
                onChange={(e) => setFormData({ ...formData, enfoqueClinico: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TherapistsDirectory;

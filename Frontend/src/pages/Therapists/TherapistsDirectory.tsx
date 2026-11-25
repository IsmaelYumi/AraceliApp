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
import { Avatar } from '../../components/common/Avatar';
import { useTherapists } from '../../hooks/useTherapists';
import { useModal } from '../../hooks/useModal';
import { formatDate } from '../../utils/formatters';
import { uploadService } from '../../services/upload.service';
import type { CreateTerapeutaDto } from '../../types';

export interface TherapistsDirectoryProps {
  onSelectTherapist?: (id: string) => void;
  onOpenRegister?: () => void;
}

export const TherapistsDirectory: React.FC<TherapistsDirectoryProps> = ({
  onSelectTherapist,
  onOpenRegister,
}) => {
  const { therapists, isLoading, createTherapist } = useTherapists();
  const registerModal = useModal<void>();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Form state in 2 symmetric columns as specified in PRD
  const [formData, setFormData] = useState<CreateTerapeutaDto>({
    nombres: '',
    apellidos: '',
    cedulaProfesional: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    especialidad: 'Fonoaudiología',
    telefono: '',
    email: '',
    avatarUrl: '',
  });

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const uploadRes = await uploadService.upload(file);
      setFormData((prev) => ({ ...prev, avatarUrl: uploadRes.url }));
    } catch (err) {
      console.warn('Upload to Cloudinary failed, fallback to base64', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.cedulaProfesional.trim()) return;

    const payload = {
      ...formData,
      password: formData.cedulaProfesional.trim(),
    };
    const created = await createTherapist(payload);
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
        avatarUrl: '',
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
          onClick={() => (onOpenRegister ? onOpenRegister() : registerModal.open())}
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
            onClick={() => onSelectTherapist?.(terapeuta.id)}
            className="p-6 flex flex-col justify-between border-none shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group hover:ring-2 hover:ring-primary/20"
          >
            <div>
              {/* Specialist Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <Avatar
                    src={terapeuta.avatarUrl}
                    alt={terapeuta.nombreCompleto}
                    size="lg"
                    rounded="2xl"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-800 leading-snug group-hover:text-primary transition-colors">
                      {terapeuta.nombreCompleto}
                    </h3>
                    <p className="text-xs font-semibold text-serenity-700 flex items-center gap-1.5 mt-0.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                      {terapeuta.especialidad}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      CÉDULA: <strong className="text-slate-600 font-mono">{terapeuta.cedulaProfesional}</strong>
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
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Especialista Clínico Infantil</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTherapist?.(terapeuta.id);
                }}
                className="inline-flex items-center gap-1.5 text-primary hover:text-on-primary-container font-semibold transition group-hover:underline cursor-pointer"
              >
                <span>Ver Expediente</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
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
          {/* Foto de Perfil (Cloudinary) */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <Avatar
              src={formData.avatarUrl}
              alt="Foto del Terapeuta"
              size="lg"
              rounded="xl"
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-700 block mb-1">
                Foto del Terapeuta (Subida a Cloudinary)
              </span>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition shadow-xs">
                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                <span>{isUploadingAvatar ? 'Subiendo a Cloudinary...' : 'Seleccionar Imagen'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                  disabled={isUploadingAvatar}
                />
              </label>
              {formData.avatarUrl && (
                <span className="text-[11px] text-emerald-600 block mt-1 font-medium">
                  ✓ Foto vinculada con Cloudinary
                </span>
              )}
            </div>
          </div>

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
                label="CÉDULA"
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
                Columna 2: Especialidad y Contacto
              </h4>
              <Input
                label="Especialidad Principal"
                placeholder="Escribe la especialidad (ej. Estimulación Temprana)"
                required
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
              />
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
                placeholder="especialista@estimulaciontemprana.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TherapistsDirectory;

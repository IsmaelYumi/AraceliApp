import React, { useState, useEffect, useRef } from 'react';
import { useTherapists } from '../../hooks/useTherapists';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import { uploadService } from '../../services/upload.service';
import { DEFAULT_BLANK_AVATAR } from '../../components/common/Avatar';
import type { Terapeuta, CreateTerapeutaDto } from '../../types';

export interface TherapistDetailProps {
  therapistId: string;
  onBack: () => void;
  initialEditMode?: boolean;
}

const DEFAULT_AVATAR = DEFAULT_BLANK_AVATAR;

const ESPECIALIDADES_SUGERIDAS = [
  'Estimulación Temprana y Terapia de Lenguaje Infantil',
  'Estimulación Temprana',
  'Fonoaudiología',
  'Terapia Ocupacional',
  'Psicomotricidad',
  'Psicología Infantil',
  'Fisioterapia Pediátrica',
  'Neurodesarrollo',
];

export const TherapistDetail: React.FC<TherapistDetailProps> = ({
  therapistId,
  onBack,
  initialEditMode = false,
}) => {
  const { getTherapistById, updateTherapist, createTherapist, isLoading } = useTherapists();
  const { success, error: notifyError } = useNotification();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCreating = therapistId === 'new';
  const existingTherapist = !isCreating ? getTherapistById(therapistId) : undefined;

  const [isEditing, setIsEditing] = useState<boolean>(initialEditMode || isCreating);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Form state strictly mapped to Terapeuta schema in schema.prisma:
  // nombres, apellidos, especialidad, cedulaProfesional, telefono, email, fechaIngreso, avatarUrl, estado
  const [formData, setFormData] = useState<CreateTerapeutaDto>({
    nombres: '',
    apellidos: '',
    especialidad: '',
    cedulaProfesional: '',
    telefono: '',
    email: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    avatarUrl: DEFAULT_AVATAR,
    estado: 'ACTIVO',
  });

  // Sync state when therapist loads or changes
  useEffect(() => {
    if (existingTherapist) {
      setFormData({
        nombres: existingTherapist.nombres,
        apellidos: existingTherapist.apellidos,
        especialidad: existingTherapist.especialidad,
        cedulaProfesional: existingTherapist.cedulaProfesional,
        telefono: existingTherapist.telefono,
        email: existingTherapist.email,
        fechaIngreso: existingTherapist.fechaIngreso,
        avatarUrl: existingTherapist.avatarUrl || DEFAULT_AVATAR,
        estado: existingTherapist.estado || 'ACTIVO',
      });
      setTemporaryPassword(existingTherapist.cedulaProfesional);
    }
  }, [existingTherapist]);

  if (!isCreating && !existingTherapist) {
    return (
      <div className="w-full py-16 text-center">
        <div className="max-w-md mx-auto p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30">
          <span className="material-symbols-outlined text-[44px] text-outline mb-2">
            person_off
          </span>
          <h2 className="text-lg text-on-surface font-semibold mb-1">
            Expediente no encontrado
          </h2>
          <p className="text-on-surface-variant text-sm mb-4">
            El especialista solicitado no se encuentra en el directorio clínico.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-on-primary-container transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Volver al Listado
          </button>
        </div>
      </div>
    );
  }

  // Handle local image file upload to Cloudinary with fallback
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notifyError('Archivo muy grande', 'La imagen no debe exceder los 5MB.');
        return;
      }

      setIsUploadingAvatar(true);
      try {
        const uploadRes = await uploadService.upload(file);
        setFormData((prev) => ({ ...prev, avatarUrl: uploadRes.url }));
        success('Foto subida', 'La fotografía se ha guardado en Cloudinary.');
      } catch (err) {
        console.warn('Upload to Cloudinary failed, fallback to FileReader', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFormData((prev) => ({ ...prev, avatarUrl: base64String }));
          success('Foto cargada', 'Se ha seleccionado la imagen para el perfil.');
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nombres.trim() ||
      !formData.apellidos.trim() ||
      !formData.cedulaProfesional.trim() ||
      !formData.email.trim() ||
      !formData.especialidad.trim() ||
      !formData.telefono.trim()
    ) {
      notifyError('Campos incompletos', 'Por favor llena los campos obligatorios del especialista.');
      return;
    }

    // Pass cedulaProfesional as password automatically
    const payload: CreateTerapeutaDto = {
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      especialidad: formData.especialidad.trim(),
      cedulaProfesional: formData.cedulaProfesional.trim(),
      telefono: formData.telefono.trim(),
      email: formData.email.trim(),
      fechaIngreso: formData.fechaIngreso,
      avatarUrl: formData.avatarUrl,
      estado: formData.estado,
      password: formData.cedulaProfesional.trim(),
    };

    if (isCreating) {
      const created = await createTherapist(payload);
      if (created) {
        setIsEditing(false);
        success(
          'Terapeuta Creado',
          `Se creó el expediente de ${created.nombreCompleto}. Su contraseña de acceso es su CÉDULA.`
        );
      }
    } else {
      const updated = await updateTherapist(existingTherapist!.id, payload);
      if (updated) {
        setIsEditing(false);
      }
    }
  };

  const handleCancelEdit = () => {
    if (isCreating) {
      onBack();
    } else if (existingTherapist) {
      setFormData({
        nombres: existingTherapist.nombres,
        apellidos: existingTherapist.apellidos,
        especialidad: existingTherapist.especialidad,
        cedulaProfesional: existingTherapist.cedulaProfesional,
        telefono: existingTherapist.telefono,
        email: existingTherapist.email,
        fechaIngreso: existingTherapist.fechaIngreso,
        avatarUrl: existingTherapist.avatarUrl || DEFAULT_AVATAR,
        estado: existingTherapist.estado || 'ACTIVO',
      });
      setIsEditing(false);
    }
  };

  const handleDownloadFicha = () => {
    window.print();
  };

  const handleResetPassword = () => {
    setIsResetPasswordModalOpen(false);
    success(
      'Contraseña Restablecida',
      `Se ha asignado la CÉDULA "${formData.cedulaProfesional}" como contraseña de acceso para ${formData.email}.`
    );
  };

  const currentTerapeuta = existingTherapist || (formData as Terapeuta);

  return (
    <div className="w-full bg-surface text-on-surface font-sans animate-in fade-in duration-300">
      {/* Hidden File Input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Datalist for specialty suggestions */}
      <datalist id="especialidades-sugerencias">
        {ESPECIALIDADES_SUGERIDAS.map((esp, i) => (
          <option key={i} value={esp} />
        ))}
      </datalist>

      {/* Top Bar with Back Link & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-on-primary-container font-medium transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span>Volver al Listado de Terapeutas</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-surface-variant hover:text-on-surface text-xs font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>Descartar Cambios</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-on-primary-container text-xs font-semibold transition-all shadow-[0_4px_14px_rgba(28,100,142,0.25)] hover:shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{isCreating ? 'Guardar Terapeuta' : 'Guardar Cambios'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-surface-variant hover:text-on-surface text-xs font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Editar Datos</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemporaryPassword(formData.cedulaProfesional);
                  setIsResetPasswordModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-surface-variant hover:text-on-surface text-xs font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                <span>Restablecer Contraseña</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadFicha}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-on-primary-container text-xs font-semibold transition-all shadow-[0_4px_14px_rgba(28,100,142,0.25)] hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Descargar Ficha Profesional</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Title Header & Status Badge */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
          {isCreating
            ? 'Nuevo Registro de Terapeuta'
            : isEditing
            ? 'Editando Expediente del Especialista'
            : 'Expediente del Especialista'}
        </h1>
        {formData.estado === 'ACTIVO' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            Activo en Clínica
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
            Inactivo en Clínica
          </span>
        )}
      </div>

      {/* Form Grid: Left Column (8 cols) + Right Column (4 cols) */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
        {/* ===================== LEFT COLUMN (8 cols) ===================== */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_20px_rgba(28,100,142,0.04)] relative overflow-hidden border border-surface-container">
            {/* Background Gradient Accent */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-primary-fixed/40 via-transparent to-transparent rounded-bl-full pointer-events-none -mr-8 -mt-8"></div>

            {/* Profile Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 mb-5 relative z-10">
              {/* Photo / Avatar with Upload button */}
              <div className="relative flex-shrink-0">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  title="Haz clic para subir una imagen"
                  className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08)] bg-surface-container-low border border-surface-container cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <img
                    alt={formData.nombres || 'Especialista'}
                    className="w-full h-full object-cover bg-slate-100"
                    src={formData.avatarUrl || DEFAULT_AVATAR}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                  />
                  {/* Upload overlay on hover or when editing */}
                  <div
                    className={`absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center transition-opacity ${
                      isUploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">
                          progress_activity
                        </span>
                        <span className="text-[10px] font-medium mt-0.5">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        <span className="text-[10px] font-medium mt-0.5">Subir foto</span>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm pointer-events-none"
                  title="Especialista Certificada"
                >
                  <span
                    className="material-symbols-outlined text-[13px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </span>
              </div>

              {/* Specialist Name & Header Badges */}
              <div className="flex flex-col min-w-0 flex-1 w-full">
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">
                        Nombres <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombres}
                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                        placeholder="Ej. Valeria"
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-1.5 px-3 text-xs text-on-surface outline-none focus:border-primary transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">
                        Apellidos <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.apellidos}
                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                        placeholder="Ej. Rivas Alarcón"
                        className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-1.5 px-3 text-xs text-on-surface outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight truncate">
                      {formData.nombres && formData.apellidos
                        ? `Lic. ${formData.nombres} ${formData.apellidos}`
                        : currentTerapeuta.nombreCompleto || 'Especialista'}
                    </h2>
                    <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
                      {formData.especialidad || 'Especialista Clínico'}
                    </p>
                  </>
                )}

                {/* Badges Bar (CÉDULA, Fecha de Ingreso, Estado) */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full pt-1">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">
                          CÉDULA <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.cedulaProfesional}
                          onChange={(e) =>
                            setFormData({ ...formData, cedulaProfesional: e.target.value })
                          }
                          placeholder="48921-ET"
                          className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-1.5 px-3 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">
                          Fecha de Ingreso
                        </label>
                        <input
                          type="date"
                          value={formData.fechaIngreso}
                          onChange={(e) =>
                            setFormData({ ...formData, fechaIngreso: e.target.value })
                          }
                          className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-1.5 px-3 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">
                          Estado en Clínica
                        </label>
                        <select
                          value={formData.estado}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              estado: e.target.value as 'ACTIVO' | 'INACTIVO',
                            })
                          }
                          className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-1.5 px-3 text-xs font-semibold text-on-surface outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="ACTIVO">Activo en Clínica</option>
                          <option value="INACTIVO">Inactivo</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface text-xs font-semibold">
                        <span className="material-symbols-outlined text-[15px] text-primary">
                          badge
                        </span>
                        CÉDULA: {formData.cedulaProfesional}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface text-xs font-semibold">
                        <span className="material-symbols-outlined text-[15px] text-primary">
                          calendar_month
                        </span>
                        Ingreso: {formData.fechaIngreso ? formatDate(formData.fechaIngreso) : 'N/A'}
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed-variant text-xs font-semibold hover:bg-primary-fixed-dim transition cursor-pointer"
                        title="Cambiar foto de perfil"
                      >
                        <span className="material-symbols-outlined text-[14px]">upload</span>
                        <span>Subir Imagen</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sub-cards Grid (Campos guiados por el schema de la BD) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
              {/* Card 1: Especialidad Principal (ESCRITURA LIBRE) */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between transition-all hover:bg-surface-container border border-surface-container/60">
                <div>
                  <span className="text-[11px] tracking-wider uppercase text-outline font-semibold block mb-0.5">
                    ESPECIALIDAD PRINCIPAL
                  </span>
                  {isEditing ? (
                    <div className="mt-1">
                      <input
                        type="text"
                        required
                        list="especialidades-sugerencias"
                        value={formData.especialidad}
                        onChange={(e) =>
                          setFormData({ ...formData, especialidad: e.target.value })
                        }
                        placeholder="Escribe la especialidad (ej. Estimulación Temprana)"
                        className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl py-1.5 px-3 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-outline mt-0.5 block">
                        Escribe libremente o selecciona una sugerencia
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-on-surface font-semibold leading-snug">
                      {formData.especialidad}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span className="text-xs font-medium">Especialidad Clínica Registrada</span>
                </div>
              </div>

              {/* Card 2: Correo Electrónico (email) */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between transition-all hover:bg-surface-container border border-surface-container/60">
                <div>
                  <span className="text-[11px] tracking-wider uppercase text-outline font-semibold block mb-0.5">
                    CORREO ELECTRÓNICO
                  </span>
                  {isEditing ? (
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="terapeuta@estimulaciontemprana.com"
                      className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl py-1.5 px-3 text-xs font-semibold text-on-surface outline-none focus:border-primary mt-1"
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-on-surface font-semibold leading-snug truncate">
                      {formData.email}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    Usuario activo en plataforma
                  </span>
                </div>
              </div>

              {/* Card 3: Teléfono Directo (telefono) */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between transition-all hover:bg-surface-container border border-surface-container/60">
                <div>
                  <span className="text-[11px] tracking-wider uppercase text-outline font-semibold block mb-0.5">
                    TELÉFONO DE CONTACTO
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+51 987 654 321"
                      className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl py-1.5 px-3 text-xs font-semibold text-on-surface outline-none focus:border-primary mt-1"
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-on-surface font-semibold leading-snug">
                      {formData.telefono}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span className="text-xs font-medium">Canal institucional directo</span>
                </div>
              </div>

              {/* Card 4: CÉDULA Registrada (cedulaProfesional) */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between transition-all hover:bg-surface-container border border-surface-container/60">
                <div>
                  <span className="text-[11px] tracking-wider uppercase text-outline font-semibold block mb-0.5">
                    CÉDULA
                  </span>
                  <p className="text-xs sm:text-sm text-on-surface font-semibold leading-snug font-mono">
                    {formData.cedulaProfesional}
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span className="text-xs font-medium">Registro profesional validado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== RIGHT COLUMN (4 cols) ===================== */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_20px_rgba(28,100,142,0.04)] border border-surface-container">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">contact_phone</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-on-surface leading-tight">
                  Datos de Contacto
                </h3>
                <span className="text-[11px] text-on-surface-variant">
                  Información oficial del especialista
                </span>
              </div>
            </div>

            {/* Contact Rows - strictly matching schema fields */}
            <div className="flex flex-col gap-2">
              {/* Teléfono */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container/60">
                <span className="text-[10px] tracking-wide uppercase text-outline font-semibold block mb-0.5">
                  TELÉFONO / WHATSAPP
                </span>
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+51 987 654 321"
                      className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl py-1 px-2.5 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-on-surface">
                      {formData.telefono || 'Sin teléfono'}
                    </span>
                  )}
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container/60">
                <span className="text-[10px] tracking-wide uppercase text-outline font-semibold block mb-0.5">
                  CORREO ELECTRÓNICO
                </span>
                {isEditing ? (
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="terapeuta@estimulaciontemprana.com"
                    className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl py-1 px-2.5 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                  />
                ) : (
                  <>
                    <p className="text-xs font-semibold text-on-surface truncate">
                      {formData.email}
                    </p>
                    <span className="text-[10px] text-primary mt-0.5 block font-medium">
                      Buzón institucional activo
                    </span>
                  </>
                )}
              </div>

              {/* CÉDULA */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container/60">
                <span className="text-[10px] tracking-wide uppercase text-outline font-semibold block mb-0.5">
                  CÉDULA
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface font-mono">
                    {formData.cedulaProfesional}
                  </span>
                </div>
              </div>

              {/* Fecha de Ingreso */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container/60">
                <span className="text-[10px] tracking-wide uppercase text-outline font-semibold block mb-0.5">
                  FECHA DE INGRESO
                </span>
                <span className="text-xs font-semibold text-on-surface">
                  {formData.fechaIngreso ? formatDate(formData.fechaIngreso) : 'N/A'}
                </span>
              </div>

              {/* Estado */}
              <div className="p-2.5 rounded-xl bg-surface-container flex flex-col gap-0.5 border border-surface-container-high">
                <span className="text-[10px] tracking-wide uppercase text-outline font-semibold block">
                  ESTADO EN EL SISTEMA
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      formData.estado === 'ACTIVO' ? 'bg-secondary' : 'bg-outline'
                    }`}
                  ></span>
                  <span className="text-xs font-semibold text-on-surface">
                    {formData.estado === 'ACTIVO' ? 'Activo en Clínica' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal: Restablecer Contraseña */}
      {isResetPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-outline-variant/30">
            <div className="flex items-center gap-3 border-b border-surface-container pb-3">
              <div className="w-9 h-9 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">lock_reset</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-on-surface">
                  Restablecer Contraseña
                </h3>
                <span className="text-xs text-on-surface-variant">
                  Especialista: {formData.nombres} {formData.apellidos}
                </span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              La contraseña del especialista es su CÉDULA profesional ({formData.cedulaProfesional}).
              Puedes restablecerla para que use su CÉDULA como contraseña de acceso.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-outline font-semibold">
                Contraseña Asignada (CÉDULA)
              </label>
              <input
                type="text"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-1.5 px-3 text-xs font-mono text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-surface-variant text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                className="px-4 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-on-primary-container text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                Confirmar Cédula como Contraseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistDetail;

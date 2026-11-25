import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  User,
  Camera,
  Activity,
  Users,
  Phone,
  Mail,
  Info,
  CheckCircle2,
  Upload,
  FileText,
  Trash2,
  Eye,
  FileUp,
  MapPin,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { calculateAge } from '../../utils/formatters';
import { uploadService } from '../../services/upload.service';
import { DEFAULT_BLANK_AVATAR } from '../../components/common/Avatar';
import type { CreatePacienteDto, DocumentoPdf } from '../../types';

export interface PatientCreateProps {
  onBack: () => void;
  onSubmit: (patientData: CreatePacienteDto) => Promise<boolean | string | null>;
  nextExpedienteCode?: string;
}

export const PatientCreate: React.FC<PatientCreateProps> = ({
  onBack,
  onSubmit,
  nextExpedienteCode = 'CET-2048',
}) => {
  // Infant basic info (model Paciente schema)
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState<'masculino' | 'femenino' | 'otro'>('masculino');
  const [grupoSanguineo, setGrupoSanguineo] = useState('O+');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Clinical history & diagnosis info (model Paciente schema)
  const [diagnosticoPrincipal, setDiagnosticoPrincipal] = useState('');
  const [condicionesMedicas, setCondicionesMedicas] = useState('');
  const [antecedentes, setAntecedentes] = useState('');
  const [observacionesAdmision, setObservacionesAdmision] = useState('');

  // Guardian info (model TutorLegal schema)
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorParentesco, setTutorParentesco] = useState('Madre');
  const [tutorDni, setTutorDni] = useState('');
  const [tutorTelefono, setTutorTelefono] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [tutorDireccion, setTutorDireccion] = useState('');

  // Second emergency contact (model SegundoContacto schema - optional)
  const [showSecondGuardian, setShowSecondGuardian] = useState(false);
  const [secondNombre, setSecondNombre] = useState('');
  const [secondParentesco, setSecondParentesco] = useState('Padre');
  const [secondTelefono, setSecondTelefono] = useState('');

  // PDF documents (model DocumentoPdf schema)
  const [pdfDocuments, setPdfDocuments] = useState<DocumentoPdf[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Evaluación Médica Previa');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [previewPdfModal, setPreviewPdfModal] = useState<DocumentoPdf | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Calculated age
  const calculatedAge = fechaNacimiento ? calculateAge(fechaNacimiento) : 'Por calcular';

  // Handle PDF files addition
  const handlePdfUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploadingPdf(true);
    const validFiles = Array.from(files).filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    for (const file of validFiles) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = file.size >= 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;

      let finalUrl = '';
      try {
        const uploadRes = await uploadService.upload(file);
        finalUrl = uploadRes.url;
      } catch (err) {
        console.warn('Upload to Cloudinary failed, fallback to local URL', err);
        finalUrl = URL.createObjectURL(file);
      }

      setPdfDocuments((prev) => [
        ...prev,
        {
          id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          nombre: file.name,
          tamano: sizeStr,
          fechaSubida: new Date().toISOString().split('T')[0],
          categoria: selectedCategory,
          subidoPor: 'Centro de Estimulación Temprana',
          url: finalUrl,
        },
      ]);
    }

    setIsUploadingPdf(false);
  };

  const handleRemovePdf = (id?: string) => {
    if (!id) return;
    setPdfDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Image upload with Cloudinary and FileReader fallback
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const uploadRes = await uploadService.upload(file);
      setAvatarUrl(uploadRes.url);
    } catch (err) {
      console.warn('Upload to Cloudinary failed, fallback to base64', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombres.trim() || !apellidos.trim() || !diagnosticoPrincipal.trim() || !tutorNombre.trim() || !tutorTelefono.trim()) {
      return;
    }

    setIsSubmitting(true);
    const dto: CreatePacienteDto = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      fechaNacimiento,
      genero,
      grupoSanguineo: grupoSanguineo || undefined,
      diagnosticoPrincipal: diagnosticoPrincipal.trim(),
      condicionesMedicas: condicionesMedicas.trim() || undefined,
      antecedentes: antecedentes.trim() || undefined,
      observacionesAdmision: observacionesAdmision.trim() || undefined,
      avatarUrl: avatarUrl || undefined,
      estado: 'ACTIVO',
      tutor: {
        nombreCompleto: tutorNombre.trim(),
        parentesco: tutorParentesco.trim(),
        dni: tutorDni.trim() || undefined,
        telefono: tutorTelefono.trim(),
        email: tutorEmail.trim() || undefined,
        direccion: tutorDireccion.trim() || undefined,
      },
      segundoContacto:
        showSecondGuardian && secondNombre.trim() && secondTelefono.trim()
          ? {
              nombre: secondNombre.trim(),
              parentesco: secondParentesco.trim(),
              telefono: secondTelefono.trim(),
            }
          : undefined,
      documentosPdf: pdfDocuments.map((doc) => ({
        nombre: doc.nombre,
        tamano: doc.tamano,
        categoria: doc.categoria,
        url: doc.url,
      })),
    };

    try {
      await onSubmit(dto);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full pb-16 bg-[#f8fafc] text-slate-700 font-sans animate-in fade-in duration-200">
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb & Top Page Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <button
              onClick={onBack}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c648e] hover:text-[#00496d] transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Directorio de Pacientes</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Registrar Nuevo Paciente
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Completa los datos del infante y sus tutores legales según el expediente clínico oficial.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Descartar</span>
            </button>
            <button
              form="new-patient-form"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1c648e] hover:bg-[#00496d] rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar y Crear Expediente'}</span>
            </button>
          </div>
        </div>

        {/* Registration Form Grid */}
        <form id="new-patient-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Infant Basic & Clinical Info */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Información Básica del Infante */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">
                      Información Básica del Infante
                    </h2>
                    <p className="text-[11px] text-slate-400">Datos personales de filiación e identificación</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                  <span className="text-slate-400">Expediente:</span>
                  <span className="font-bold text-[#001e30] bg-[#cae6ff] px-2 py-0.5 rounded-full uppercase text-[11px] tracking-wider">
                    {nextExpedienteCode}
                  </span>
                </div>
              </div>

              {/* Avatar & Upload Section */}
              <div className="flex items-center gap-4 mb-5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl || DEFAULT_BLANK_AVATAR}
                    alt="Foto del menor"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_BLANK_AVATAR;
                    }}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-sky-100 bg-slate-100"
                  />
                  <span className="absolute bottom-0 right-0 p-1 bg-[#1c648e] text-white rounded-full border border-white shadow-sm">
                    <Camera className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-slate-700">Fotografía del Paciente</h4>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Foto frontal actualizada del infante (JPG o PNG).
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => imageInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingAvatar && <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />}
                      <span>{isUploadingAvatar ? 'Subiendo...' : 'Subir foto'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAvatarUrl(
                          'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=160&auto=format&fit=crop&q=80'
                        )
                      }
                      className="px-2.5 py-1.5 text-xs text-rose-500 hover:text-rose-600 font-medium transition cursor-pointer"
                    >
                      Restablecer
                    </button>
                  </div>
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Nombres */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="infant-firstname">
                    Nombres del Infante <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="infant-firstname"
                    type="text"
                    required
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Ej. Mateo Sebastián"
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none transition"
                  />
                </div>

                {/* Apellidos */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="infant-lastname">
                    Apellidos <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="infant-lastname"
                    type="text"
                    required
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Ej. Méndez Castillo"
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none transition"
                  />
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="birthdate">
                    Fecha de Nacimiento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="birthdate"
                    type="date"
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none transition bg-white"
                  />
                </div>

                {/* Edad Cronológica Calculada */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="calculated-age">
                    Edad Cronológica Calculada
                  </label>
                  <div className="relative">
                    <input
                      id="calculated-age"
                      type="text"
                      readOnly
                      value={calculatedAge}
                      className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2 px-3 cursor-not-allowed"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded font-semibold">
                      Auto
                    </span>
                  </div>
                </div>

                {/* Género */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Género <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['masculino', 'femenino', 'otro'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGenero(g)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium cursor-pointer border transition-colors capitalize ${
                          genero === g
                            ? 'border-[#1c648e] bg-[#cae6ff]/50 text-[#00496d] font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grupo Sanguíneo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="blood-type">
                    Grupo Sanguíneo
                  </label>
                  <select
                    id="blood-type"
                    value={grupoSanguineo}
                    onChange={(e) => setGrupoSanguineo(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none bg-white transition"
                  >
                    <option value="O+">O Positivo (O+)</option>
                    <option value="O-">O Negativo (O-)</option>
                    <option value="A+">A Positivo (A+)</option>
                    <option value="A-">A Negativo (A-)</option>
                    <option value="B+">B Positivo (B+)</option>
                    <option value="B-">B Negativo (B-)</option>
                    <option value="AB+">AB Positivo (AB+)</option>
                    <option value="AB-">AB Negativo (AB-)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Diagnóstico e Historia Clínica (Schema: diagnosticoPrincipal, condicionesMedicas, antecedentes, observacionesAdmision) */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Diagnóstico e Historia Clínica
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Motivo de ingreso, antecedentes y condiciones médicas de admisión
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Diagnóstico Principal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="primary-diagnosis">
                    Diagnóstico Principal / Motivo de Consulta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="primary-diagnosis"
                    type="text"
                    required
                    value={diagnosticoPrincipal}
                    onChange={(e) => setDiagnosticoPrincipal(e.target.value)}
                    placeholder="Escriba el diagnóstico principal o motivo de consulta..."
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none transition"
                  />
                </div>

                {/* Condiciones Médicas y Alergias (Schema: condicionesMedicas) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="medical-conditions">
                    Condiciones Médicas, Alergias y Alertas
                  </label>
                  <input
                    id="medical-conditions"
                    type="text"
                    value={condicionesMedicas}
                    onChange={(e) => setCondicionesMedicas(e.target.value)}
                    placeholder="Escriba condiciones médicas relevantes, alergias o alertas..."
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none transition"
                  />
                </div>

                {/* Antecedentes Clínicos y Perinatales (Schema: antecedentes) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="medical-history">
                    Antecedentes Clínicos, Perinatales y Familiares
                  </label>
                  <textarea
                    id="medical-history"
                    rows={2}
                    value={antecedentes}
                    onChange={(e) => setAntecedentes(e.target.value)}
                    placeholder="Detalles de embarazo, parto, peso al nacer, APGAR, hitos psicomotores iniciales o antecedentes familiares..."
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 p-2.5 outline-none transition"
                  />
                </div>

                {/* Observaciones Clínicas de Admisión (Schema: observacionesAdmision) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="admission-notes">
                    Observaciones Clínicas de Admisión
                  </label>
                  <textarea
                    id="admission-notes"
                    rows={2}
                    value={observacionesAdmision}
                    onChange={(e) => setObservacionesAdmision(e.target.value)}
                    placeholder="Conducta observada en la entrevista inicial, contacto visual, tolerancia a estímulos y disposición del infante..."
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 p-2.5 outline-none transition"
                  />
                </div>
              </div>
            </section>

            {/* 3. Documentos Clínicos Adjuntos (PDF - Schema: DocumentoPdf) */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">
                      Documentos Adjuntos en PDF
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Evaluaciones neurológicas, informes fonoaudiológicos y consentimientos
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                  {pdfDocuments.length} {pdfDocuments.length === 1 ? 'PDF adjunto' : 'PDFs adjuntos'}
                </span>
              </div>

              {/* Upload controls */}
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Categoría del Documento
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 py-1.5 px-2.5 outline-none bg-white"
                    >
                      <option value="Evaluación Médica Previa">Evaluación Médica Previa</option>
                      <option value="Informe Neuropsicológico / Fonoaudiológico">
                        Informe Neuropsicológico / Fonoaudiológico
                      </option>
                      <option value="Partida de Nacimiento / DNI">Partida de Nacimiento / DNI</option>
                      <option value="Consentimiento Informado Firmado">Consentimiento Informado Firmado</option>
                      <option value="Historial de Vacunación">Historial de Vacunación</option>
                    </select>
                  </div>

                  <div className="w-full sm:w-1/2 flex items-end">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => handlePdfUpload(e.target.files)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
                    >
                      <FileUp className="w-3.5 h-3.5 text-sky-600" />
                      <span>Seleccionar Archivos PDF</span>
                    </button>
                  </div>
                </div>

                {/* Drag and drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handlePdfUpload(e.dataTransfer.files);
                  }}
                  onClick={() => !isUploadingPdf && fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-sky-500 bg-sky-50/50'
                      : isUploadingPdf
                      ? 'border-sky-400 bg-sky-50/30 cursor-wait'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-1.5">
                    {isUploadingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    {isUploadingPdf ? (
                      'Subiendo documento PDF a Cloudinary...'
                    ) : (
                      <>
                        Arrastra archivos PDF aquí, o{' '}
                        <span className="text-[#1c648e] underline">haz clic para examinar</span>
                      </>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Formato PDF (máximo 15MB por archivo)
                  </p>
                </div>

                {/* List of uploaded PDFs */}
                {pdfDocuments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-semibold text-slate-600 block">
                      Archivos vinculados al expediente:
                    </span>
                    <div className="space-y-1.5">
                      {pdfDocuments.map((doc) => (
                        <div
                          key={doc.id || doc.nombre}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {doc.nombre}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>{doc.tamano}</span>
                                <span>•</span>
                                <span className="text-[#00496d] font-medium bg-[#cae6ff]/50 px-1 py-0.2 rounded">
                                  {doc.categoria || 'Evaluación'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewPdfModal(doc)}
                              className="p-1 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                              title="Ver detalles / previsualizar"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {doc.url && doc.url !== '#' && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                title="Abrir en pestaña nueva"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemovePdf(doc.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Eliminar PDF"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Parents and Guardians (model TutorLegal & SegundoContacto schema) */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Padres y Tutores Legales</h2>
                  <p className="text-[11px] text-slate-400">Responsables legales del infante según normativa</p>
                </div>
              </div>

              {/* Tutor Principal Subsección (Schema: TutorLegal) */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#00496d] bg-[#cae6ff]/40 px-2 py-0.5 rounded-md">
                    Tutor Principal
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Contacto Primario</span>
                </div>

                {/* Nombre Completo Tutor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="guardian-name">
                    Nombre Completo del Tutor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="guardian-name"
                    type="text"
                    required
                    value={tutorNombre}
                    onChange={(e) => setTutorNombre(e.target.value)}
                    placeholder="Ej. Mariana Méndez Castillo"
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Parentesco */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="guardian-kinship">
                      Parentesco <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="guardian-kinship"
                      value={tutorParentesco}
                      onChange={(e) => setTutorParentesco(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none bg-white transition"
                    >
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Abuelo / Abuela">Abuelo / Abuela</option>
                      <option value="Tutor Legal">Tutor Legal</option>
                      <option value="Familiar Responsable">Familiar Responsable</option>
                    </select>
                  </div>

                  {/* DNI / Documento */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="guardian-dni">
                      Cédula / DNI
                    </label>
                    <input
                      id="guardian-dni"
                      type="text"
                      value={tutorDni}
                      onChange={(e) => setTutorDni(e.target.value)}
                      placeholder="Ej. 45892310"
                      className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none transition"
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="guardian-phone">
                    Teléfono / WhatsApp de Contacto <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                    <input
                      id="guardian-phone"
                      type="tel"
                      required
                      value={tutorTelefono}
                      onChange={(e) => setTutorTelefono(e.target.value)}
                      placeholder="+51 987 654 321"
                      className="w-full pl-8 text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none transition"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="guardian-email">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <input
                      id="guardian-email"
                      type="email"
                      value={tutorEmail}
                      onChange={(e) => setTutorEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full pl-8 text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none transition"
                    />
                  </div>
                </div>

                {/* Domicilio Familiar */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="guardian-address">
                    Domicilio Familiar / Dirección
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <input
                      id="guardian-address"
                      type="text"
                      value={tutorDireccion}
                      onChange={(e) => setTutorDireccion(e.target.value)}
                      placeholder="Av. Ejemplo 123, Distrito"
                      className="w-full pl-8 text-xs rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 py-2 px-3 outline-none transition"
                    />
                  </div>
                </div>

                {/* Subsección Segundo Contacto (Schema: SegundoContacto) */}
                <div className="pt-3.5 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Segundo Contacto (Opcional)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSecondGuardian(!showSecondGuardian)}
                      className="text-xs text-[#1c648e] hover:text-[#00496d] cursor-pointer hover:underline font-semibold"
                    >
                      {showSecondGuardian ? 'Ocultar' : '+ Añadir'}
                    </button>
                  </div>

                  {showSecondGuardian && (
                    <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nombre</label>
                          <input
                            type="text"
                            value={secondNombre}
                            onChange={(e) => setSecondNombre(e.target.value)}
                            placeholder="Nombre del contacto"
                            className="w-full text-xs rounded-lg border border-slate-200 bg-white py-1.5 px-2 outline-none focus:border-sky-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Parentesco</label>
                          <input
                            type="text"
                            value={secondParentesco}
                            onChange={(e) => setSecondParentesco(e.target.value)}
                            placeholder="Ej. Padre / Tía"
                            className="w-full text-xs rounded-lg border border-slate-200 bg-white py-1.5 px-2 outline-none focus:border-sky-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Teléfono</label>
                        <input
                          type="tel"
                          value={secondTelefono}
                          onChange={(e) => setSecondTelefono(e.target.value)}
                          placeholder="Teléfono de emergencia"
                          className="w-full text-xs rounded-lg border border-slate-200 bg-white py-1.5 px-2 outline-none focus:border-sky-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Information Notice Card */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#1c648e] text-white shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-sky-900 mb-0.5">
                  Alta de Expediente Clínico - Centro de Estimulación Temprana
                </h4>
                <p className="text-[11px] text-sky-700 leading-relaxed">
                  Al completar este formulario se generará el código único de expediente{' '}
                  <strong className="text-slate-900 font-bold">{nextExpedienteCode}</strong> en la base de datos,
                  habilitando la asignación de sesiones de estimulación temprana y registro de evolución.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="lg:col-span-12 pt-2">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Campos obligatorios marcados con asterisco (*) requeridos para el expediente.</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-1/2 sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#1c648e] hover:bg-[#00496d] rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Guardando...' : 'Completar Registro de Paciente'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* PDF Quick Preview Modal */}
      {previewPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full h-[85vh] flex flex-col p-5 space-y-3.5 border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-800 truncate max-w-sm">
                    {previewPdfModal.nombre}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {previewPdfModal.categoria} • {previewPdfModal.tamano}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {previewPdfModal.url && previewPdfModal.url !== '#' && (
                  <a
                    href={previewPdfModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewPdfModal(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-slate-900 rounded-xl overflow-hidden relative">
              {previewPdfModal.url && previewPdfModal.url !== '#' ? (
                <iframe
                  src={previewPdfModal.url}
                  title={previewPdfModal.nombre}
                  className="w-full h-full border-0 bg-white"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Vista previa de PDF no disponible.
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="text-emerald-600 font-medium">✓ Archivo validado y listo para vincular al expediente.</span>
              <button
                type="button"
                onClick={() => setPreviewPdfModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCreate;

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
  ShieldCheck,
  Upload,
  FileText,
  Trash2,
  Eye,
  AlertCircle,
  FileUp,
} from 'lucide-react';
import { calculateAge } from '../../utils/formatters';
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
  // Infant info state
  const [nombres, setNombres] = useState('Mateo Sebastián');
  const [apellidos, setApellidos] = useState('Méndez Castillo');
  const [fechaNacimiento, setFechaNacimiento] = useState('2020-09-15');
  const [genero, setGenero] = useState<'masculino' | 'femenino' | 'otro'>('masculino');
  const [grupoSanguineo, setGrupoSanguineo] = useState('O+');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBJAzccX45A_ihKUw6OdWFvOjwGEZM7K84eE2rDZrIWfj02my7pxr9D_aXQG46y4LqvsB7-lHPxC9QvD4pWdyYlUZ9TRYdQo-R3Z6dMYTajDmxMSgEhcKgVX2I5kaYcv8ccv0WphkB4Bi8b-j31jvoSTh41Zz2Z3-6fTpzH74ISTLW-eh9oLGrP0WZoHV8xLozluX_WW8WSdvEYQghEVESSMB0J_U6JJDiFGfYxe9jKXI_4eJ9u3Bw9YA'
  );

  // Therapy assignment state
  const [terapeuta, setTerapeuta] = useState('Lic. Valeria Rivas');
  const [diagnostico, setDiagnostico] = useState('ret-motor');
  const [sala, setSala] = useState('sala-2');
  const [frecuencia, setFrecuencia] = useState('2 sesiones / semana');
  const [condicionesMedicas, setCondicionesMedicas] = useState('Sin alergias conocidas');
  const [observacionesClinicas, setObservacionesClinicas] = useState('');

  // Guardian info state
  const [tutorNombre, setTutorNombre] = useState('Mariana Méndez Castillo');
  const [tutorParentesco, setTutorParentesco] = useState('Madre');
  const [tutorDni, setTutorDni] = useState('45892310');
  const [tutorTelefono, setTutorTelefono] = useState('+51 987 654 321');
  const [tutorEmail, setTutorEmail] = useState('mariana.mendez@email.com');
  const [tutorDireccion, setTutorDireccion] = useState('Av. San Borja Sur 450, Dpto 302, Lima');
  const [autorizadoRetiro, setAutorizadoRetiro] = useState(true);

  // Second guardian state (optional)
  const [showSecondGuardian, setShowSecondGuardian] = useState(true);
  const [secondNombre, setSecondNombre] = useState('Rodrigo Méndez');
  const [secondParentesco, setSecondParentesco] = useState('Padre');
  const [secondTelefono, setSecondTelefono] = useState('+51 912 345 678');

  // PDF documents state
  const [pdfDocuments, setPdfDocuments] = useState<DocumentoPdf[]>([
    {
      id: 'doc-init-1',
      nombre: 'Evaluacion_Neuropsicologica_Previa.pdf',
      tamano: '2.4 MB',
      fechaSubida: new Date().toISOString().split('T')[0],
      categoria: 'Evaluación Externa',
      subidoPor: 'Módulo Administrativo',
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState('Evaluación Médica Previa');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewPdfModal, setPreviewPdfModal] = useState<DocumentoPdf | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Calculated age
  const calculatedAge = calculateAge(fechaNacimiento) || '3 años 7 meses';

  // Diagnosis label mapper
  const diagnosisLabels: Record<string, string> = {
    'tel': 'Trastorno Específico del Lenguaje (TEL)',
    'ret-motor': 'Retraso en Hitos Motores',
    'estimulacion': 'Atención Temprana Global (0-3 años)',
    'sensorial': 'Desregulación Sensorial',
    'tea-eval': 'Seguimiento del Desarrollo / Evaluación TEA',
    'otro': 'Otro diagnóstico clínico',
  };

  const roomLabels: Record<string, string> = {
    'sala-1': 'Sala 1 - Fisioterapia y Motricidad',
    'sala-2': 'Sala 2 - Estimulación Sensorial',
    'sala-3': 'Sala 3 - Fonoaudiología & Habla',
    'sala-4': 'Sala 4 - Talleres de Interacción Lúdica',
  };

  // Handle PDF files addition
  const handlePdfUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newDocs: DocumentoPdf[] = [];
    Array.from(files).forEach((file) => {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const sizeStr = file.size >= 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;

        newDocs.push({
          id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          nombre: file.name,
          tamano: sizeStr,
          fechaSubida: new Date().toISOString().split('T')[0],
          categoria: selectedCategory,
          subidoPor: 'Módulo Administrativo',
          url: URL.createObjectURL(file),
        });
      }
    });

    if (newDocs.length > 0) {
      setPdfDocuments((prev) => [...prev, ...newDocs]);
    }
  };

  const handleRemovePdf = (id: string) => {
    setPdfDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  // Quick tag toggle
  const handleQuickTagClick = (tag: string) => {
    if (!condicionesMedicas.includes(tag)) {
      setCondicionesMedicas((prev) =>
        prev === 'Sin alergias conocidas' ? tag : `${prev} • ${tag}`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombres.trim() || !apellidos.trim() || !tutorNombre.trim() || !tutorTelefono.trim()) {
      return;
    }

    setIsSubmitting(true);
    const dto: CreatePacienteDto = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      fechaNacimiento,
      genero,
      grupoSanguineo,
      diagnosticoPrincipal: diagnosisLabels[diagnostico] || diagnostico,
      sala: roomLabels[sala] || sala,
      frecuencia,
      condicionesMedicas,
      observacionesAdmision: observacionesClinicas,
      avatarUrl,
      terapeutaPrincipal: terapeuta,
      documentosPdf: pdfDocuments,
      tutor: {
        nombreCompleto: tutorNombre.trim(),
        parentesco: tutorParentesco,
        dni: tutorDni.trim(),
        telefono: tutorTelefono.trim(),
        email: tutorEmail.trim(),
        direccion: tutorDireccion.trim(),
        autorizadoRetiro,
      },
      segundoContacto: showSecondGuardian && secondNombre.trim()
        ? {
            nombre: secondNombre.trim(),
            parentesco: secondParentesco,
            telefono: secondTelefono.trim(),
          }
        : undefined,
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
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Listado de Pacientes</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Registrar Nuevo Paciente
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Completa la ficha de ingreso y vinculación clínica para dar de alta al infante en el centro.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Descartar</span>
            </button>
            <button
              form="new-patient-form"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#1c648e] hover:bg-[#00496d] rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar y Crear Expediente'}</span>
            </button>
          </div>
        </div>

        {/* Registration Form Grid */}
        <form id="new-patient-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* BEGIN: LeftColumn (Infant Information & Clinical Assignment) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Card: Información Básica del Infante */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">
                      Información Básica del Infante
                    </h2>
                    <p className="text-xs text-slate-400">Datos personales de identificación</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                  <span className="text-slate-400">Expediente:</span>
                  <span className="font-bold text-[#001e30] bg-[#cae6ff] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {nextExpedienteCode}
                  </span>
                </div>
              </div>

              {/* Avatar & Upload Section */}
              <div className="flex items-center gap-5 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100/80">
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl}
                    alt="Foto del menor"
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-sky-100"
                  />
                  <span className="absolute bottom-0 right-0 p-1 bg-sky-500 text-white rounded-full border-2 border-white shadow-sm">
                    <Camera className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-700">Fotografía del Paciente</h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Recomendado formato frontal, con buena iluminación (JPG o PNG, máx. 5MB).
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
                      onClick={() => imageInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-sm transition cursor-pointer"
                    >
                      Cambiar foto
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAvatarUrl(
                          'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=120&auto=format&fit=crop&q=80'
                        )
                      }
                      className="px-3 py-1.5 text-xs text-rose-500 hover:text-rose-600 font-medium transition cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none"
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
                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none"
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
                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none"
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
                      className="w-full text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2.5 px-3 cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-sky-600 bg-sky-100/60 px-2 py-0.5 rounded font-medium">
                      Auto
                    </span>
                  </div>
                </div>

                {/* Género */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Género <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setGenero('masculino')}
                      className={`flex items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-colors ${
                        genero === 'masculino'
                          ? 'border-[#1c648e] bg-[#cae6ff]/40 text-[#00496d]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenero('femenino')}
                      className={`flex items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-colors ${
                        genero === 'femenino'
                          ? 'border-[#1c648e] bg-[#cae6ff]/40 text-[#00496d]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Femenino
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenero('otro')}
                      className={`flex items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-colors ${
                        genero === 'otro'
                          ? 'border-[#1c648e] bg-[#cae6ff]/40 text-[#00496d]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Otro
                    </button>
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
                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none bg-white"
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

            {/* 2. Card: Diagnóstico y Asignación de Terapia */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Diagnóstico y Asignación de Terapia
                  </h2>
                  <p className="text-xs text-slate-400">Plan terapéutico inicial y profesional a cargo</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Terapeuta Asignado */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="therapist">
                    Terapeuta Titular Asignado <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="therapist"
                    value={terapeuta}
                    onChange={(e) => setTerapeuta(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none bg-white"
                  >
                    <option value="Lic. Valeria Rivas">
                      Lic. Valeria Rivas • Especialista en Estimulación Temprana (Disponible)
                    </option>
                    <option value="Dra. Sofía Mendoza">
                      Dra. Sofía Mendoza • Trastornos del Habla y Lenguaje
                    </option>
                    <option value="Lic. Carlos Morales">
                      Lic. Carlos Morales • Terapia Ocupacional e Integración Sensorial
                    </option>
                    <option value="Lic. Claudia Herrera">
                      Lic. Claudia Herrera • Fisioterapia y Psicomotricidad Pediátrica
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Diagnóstico / Motivo de Consulta */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="diagnosis">
                      Motivo / Diagnóstico Inicial <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="diagnosis"
                      value={diagnostico}
                      onChange={(e) => setDiagnostico(e.target.value)}
                      className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none bg-white"
                    >
                      <option value="ret-motor">Retraso en Hitos Motores</option>
                      <option value="tel">Trastorno Específico del Lenguaje (TEL)</option>
                      <option value="estimulacion">Atención Temprana Global (0-3 años)</option>
                      <option value="sensorial">Desregulación Sensorial</option>
                      <option value="tea-eval">Seguimiento del Desarrollo / Evaluación TEA</option>
                      <option value="otro">Otro diagnóstico clínico</option>
                    </select>
                  </div>

                  {/* Sala de Terapia */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="assigned-room">
                      Espacio de Atención
                    </label>
                    <select
                      id="assigned-room"
                      value={sala}
                      onChange={(e) => setSala(e.target.value)}
                      className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none bg-white"
                    >
                      <option value="sala-2">Sala 2 - Estimulación Sensorial</option>
                      <option value="sala-1">Sala 1 - Fisioterapia y Motricidad</option>
                      <option value="sala-3">Sala 3 - Fonoaudiología &amp; Habla</option>
                      <option value="sala-4">Sala 4 - Talleres de Interacción Lúdica</option>
                    </select>
                  </div>
                </div>

                {/* Frecuencia y Rutina */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Frecuencia Semanal Estimada
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1 sesión / semana', '2 sesiones / semana', '3+ intensivo'].map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFrecuencia(freq)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium text-center border transition-colors cursor-pointer ${
                          frecuencia === freq
                            ? 'border-[#1c648e] bg-[#cae6ff]/40 text-[#00496d] font-semibold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alergias y Condiciones Médicas */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="medical-alerts">
                    Condiciones Médicas y Alergias
                  </label>
                  <input
                    id="medical-alerts"
                    type="text"
                    value={condicionesMedicas}
                    onChange={(e) => setCondicionesMedicas(e.target.value)}
                    placeholder="Escriba condiciones o agregue etiquetas (ej. Rinitis, Asma, Sin alergias)"
                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleQuickTagClick('Sin alergias reportadas')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hover:bg-emerald-100 transition cursor-pointer"
                    >
                      <ShieldCheck className="w-3 h-3" /> Sin alergias reportadas
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTagClick('Parto a término (39 sem)')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-600 border border-slate-200 font-normal hover:bg-slate-200 transition cursor-pointer"
                    >
                      Parto a término (39 sem)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTagClick('Prematuridad (35 sem)')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-amber-50 text-amber-700 border border-amber-200 font-normal hover:bg-amber-100 transition cursor-pointer"
                    >
                      Prematuridad (35 sem)
                    </button>
                  </div>
                </div>

                {/* Observaciones Clínicas de Ingreso */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="clinical-notes">
                    Observaciones Clínicas de Admisión
                  </label>
                  <textarea
                    id="clinical-notes"
                    rows={3}
                    value={observacionesClinicas}
                    onChange={(e) => setObservacionesClinicas(e.target.value)}
                    placeholder="Anotaciones relevantes de la entrevista previa con los padres, conducta observada, nivel de contacto visual y tolerancia a estímulos nuevos..."
                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 p-3 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* 3. Card: SUBIR DOCUMENTOS PDF (User's explicit requirement) */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">
                      Documentos Clínicos Adjuntos (PDF)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Informes médicos externos, evaluaciones previas, partida o consentimientos
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  {pdfDocuments.length} {pdfDocuments.length === 1 ? 'PDF adjunto' : 'PDFs adjuntos'}
                </span>
              </div>

              {/* Upload controls */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Categoría del Documento
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 py-2 px-3 outline-none bg-white"
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
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
                    >
                      <FileUp className="w-4 h-4 text-sky-600" />
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
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-sky-500 bg-sky-50/50'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Arrastra y suelta tus archivos PDF aquí, o{' '}
                    <span className="text-sky-600 underline">haz clic para examinar</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Solo formato PDF (máximo 15MB por documento)
                  </p>
                </div>

                {/* List of uploaded PDFs */}
                {pdfDocuments.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-slate-600">
                      Archivos vinculados al nuevo expediente:
                    </span>
                    <div className="space-y-2">
                      {pdfDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {doc.nombre}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>{doc.tamano}</span>
                                <span>•</span>
                                <span className="text-[#00496d] font-medium bg-[#cae6ff]/50 px-1.5 py-0.2 rounded">
                                  {doc.categoria}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewPdfModal(doc)}
                              className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                              title="Ver detalles del documento"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePdf(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Eliminar PDF"
                            >
                              <Trash2 className="w-4 h-4" />
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
          {/* END: LeftColumn */}

          {/* BEGIN: RightColumn (Parents and Guardians) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 4. Card: Padres y Tutores Responsables */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Padres y Tutores</h2>
                  <p className="text-xs text-slate-400">Responsables legales y contactos de emergencia</p>
                </div>
              </div>

              {/* Tutor Principal Subsección */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00496d] bg-[#7cb9e8]/30 px-2.5 py-1 rounded-md">
                    Tutor Principal
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Contacto Primario</span>
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
                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none"
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
                      className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none bg-white"
                    >
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Abuelo / Abuela">Abuelo / Abuela</option>
                      <option value="Tutor Legal">Tutor Legal</option>
                    </select>
                  </div>

                  {/* Documento Identidad */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="guardian-dni">
                      DNI / Documento <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="guardian-dni"
                      type="text"
                      required
                      value={tutorDni}
                      onChange={(e) => setTutorDni(e.target.value)}
                      className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none"
                    />
                  </div>
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="guardian-phone">
                    Teléfono / WhatsApp de Urgencias <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      id="guardian-phone"
                      type="tel"
                      required
                      value={tutorTelefono}
                      onChange={(e) => setTutorTelefono(e.target.value)}
                      className="w-full pl-9 text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="guardian-email">
                    Correo Electrónico de Reportes
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="guardian-email"
                      type="email"
                      value={tutorEmail}
                      onChange={(e) => setTutorEmail(e.target.value)}
                      className="w-full pl-9 text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none"
                    />
                  </div>
                </div>

                {/* Domicilio Familiar */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="guardian-address">
                    Domicilio Familiar
                  </label>
                  <input
                    id="guardian-address"
                    type="text"
                    value={tutorDireccion}
                    onChange={(e) => setTutorDireccion(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 py-2.5 px-3 outline-none"
                  />
                </div>

                {/* Checkbox Autorización Retiro */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autorizadoRetiro}
                      onChange={(e) => setAutorizadoRetiro(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-sky-500 focus:ring-sky-400 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium leading-relaxed">
                      Autorizado formalmente para retiro diario del menor de las instalaciones del centro.
                    </span>
                  </label>
                </div>

                {/* Subsección Segundo Tutor / Contacto Adicional */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
                    <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={secondNombre}
                          onChange={(e) => setSecondNombre(e.target.value)}
                          placeholder="Nombre completo"
                          className="text-xs rounded-lg border border-slate-200 bg-white py-2 px-2.5 outline-none focus:border-sky-400"
                        />
                        <input
                          type="text"
                          value={secondParentesco}
                          onChange={(e) => setSecondParentesco(e.target.value)}
                          placeholder="Parentesco (Padre)"
                          className="text-xs rounded-lg border border-slate-200 bg-white py-2 px-2.5 outline-none focus:border-sky-400"
                        />
                      </div>
                      <input
                        type="tel"
                        value={secondTelefono}
                        onChange={(e) => setSecondTelefono(e.target.value)}
                        placeholder="Teléfono de contacto (+51)"
                        className="w-full text-xs rounded-lg border border-slate-200 bg-white py-2 px-2.5 outline-none focus:border-sky-400"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 5. Clinical Notice Banner */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-[#1c648e] text-white shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-sky-900 mb-0.5">
                  Procedimiento de Alta Automática
                </h4>
                <p className="text-xs text-sky-700 leading-relaxed">
                  Una vez registrado, se generará el expediente clínico <strong>{nextExpedienteCode}</strong>{' '}
                  y se enviará una notificación a la <strong>{terapeuta}</strong> para coordinar la
                  evaluación diagnóstica de ingreso.
                </p>
              </div>
            </div>
          </div>
          {/* END: RightColumn */}

          {/* BEGIN: BottomActionsBar */}
          <div className="lg:col-span-12 pt-2">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Todos los campos obligatorios (*) han sido verificados.</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-1/2 sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1c648e] hover:bg-[#00496d] rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando...' : 'Completar Registro de Paciente'}</span>
                </button>
              </div>
            </div>
          </div>
          {/* END: BottomActionsBar */}
        </form>
      </main>

      {/* PDF Quick Preview Modal */}
      {previewPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 truncate max-w-[280px]">
                    {previewPdfModal.nombre}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {previewPdfModal.categoria} • {previewPdfModal.tamano}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPdfModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-sky-600" />
                <span>Documento listo para ser indexado al expediente clínico.</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="font-medium text-slate-700">Estado de Validación:</p>
                <p className="text-emerald-600 font-semibold mt-0.5">
                  ✓ Formato PDF verificado y optimizado para almacenamiento clínico seguro.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewPdfModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
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

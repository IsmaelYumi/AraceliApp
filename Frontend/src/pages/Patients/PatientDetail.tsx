import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  User,
  Activity,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Plus,
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  ShieldCheck,
  FileUp,
  X,
  Printer,
  Sparkles,
} from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { formatDate } from '../../utils/formatters';
import type { CreateActividadDto, DocumentoPdf } from '../../types';

export interface PatientDetailProps {
  patientId: string;
  onBack: () => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ patientId, onBack }) => {
  const {
    getPatientById,
    getPatientActivities,
    addActivity,
    uploadPatientPdf,
    deletePatientPdf,
    isLoading,
  } = usePatients();

  const patient = getPatientById(patientId);
  const activities = getPatientActivities(patientId);

  // Modals state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<DocumentoPdf | null>(null);

  // New activity form state
  const [activityForm, setActivityForm] = useState<CreateActividadDto>({
    pacienteId: patientId,
    titulo: '',
    numeroProceso: `PROC-0${activities.length + 1}`,
    duracionMinutos: 45,
    descripcion: '',
    observaciones: '',
  });

  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfCategory, setPdfCategory] = useState('Informe de Evolución');
  const [pdfTitle, setPdfTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  if (!patient) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8 max-w-xl mx-auto my-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Expediente no encontrado</h3>
        <p className="text-sm text-slate-500 mt-1">El expediente solicitado no está disponible en la base de datos.</p>
        <button
          onClick={onBack}
          type="button"
          className="mt-5 px-5 py-2.5 rounded-xl bg-[#1c648e] hover:bg-[#00496d] text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
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
      setIsActivityModalOpen(false);
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

  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile && !pdfTitle.trim()) return;

    const filename = pdfFile ? pdfFile.name : `${pdfTitle.trim().replace(/\s+/g, '_')}.pdf`;
    const sizeStr = pdfFile
      ? pdfFile.size >= 1024 * 1024
        ? `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(pdfFile.size / 1024)} KB`
      : '1.5 MB';

    await uploadPatientPdf(patientId, {
      nombre: filename,
      tamano: sizeStr,
      categoria: pdfCategory,
      url: pdfFile ? URL.createObjectURL(pdfFile) : '#',
    });

    setIsPdfUploadModalOpen(false);
    setPdfFile(null);
    setPdfTitle('');
  };

  const handlePdfFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setPdfFile(file);
      if (!pdfTitle) {
        setPdfTitle(file.name.replace(/\.pdf$/i, ''));
      }
    }
  };

  const docs = patient.documentosPdf || [];

  return (
    <div className="min-h-full pb-16 bg-[#f8fafc] text-slate-700 font-sans animate-in fade-in duration-200">
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Listado de Pacientes</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Historial Clínico del Paciente
              </h1>
              <span className="font-bold text-[#001e30] bg-[#cae6ff] px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
                {patient.codigoExpediente}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Expediente longitudinal, documentos adjuntos (PDF) y registro de evolución terapéutica.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsPdfUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#00496d] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-sky-600" />
              <span>Subir Documento PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#1c648e] hover:bg-[#00496d] rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Nota de Evolución</span>
            </button>
          </div>
        </div>

        {/* 1. Main Patient Summary Card */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={
                    patient.avatarUrl ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBJAzccX45A_ihKUw6OdWFvOjwGEZM7K84eE2rDZrIWfj02my7pxr9D_aXQG46y4LqvsB7-lHPxC9QvD4pWdyYlUZ9TRYdQo-R3Z6dMYTajDmxMSgEhcKgVX2I5kaYcv8ccv0WphkB4Bi8b-j31jvoSTh41Zz2Z3-6fTpzH74ISTLW-eh9oLGrP0WZoHV8xLozluX_WW8WSdvEYQghEVESSMB0J_U6JJDiFGfYxe9jKXI_4eJ9u3Bw9YA'
                  }
                  alt={patient.nombreCompleto}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-sky-100"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-[#001e30] bg-[#cae6ff] px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
                    {patient.codigoExpediente}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Tratamiento Activo
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md capitalize">
                    {patient.genero || 'Masculino'} • Sangre: {patient.grupoSanguineo || 'O+'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {patient.nombreCompleto}
                </h2>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span>
                    Edad:{' '}
                    <strong className="text-slate-800 font-semibold">{patient.edadTexto}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Nacimiento:{' '}
                    <strong className="text-slate-700">{formatDate(patient.fechaNacimiento)}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Ingreso:{' '}
                    <strong className="text-slate-700">{formatDate(patient.fechaIngreso)}</strong>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-col gap-3 lg:items-end text-xs text-slate-600 bg-slate-50 lg:bg-transparent p-4 lg:p-0 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                  Terapeuta Titular:
                </span>
                <span className="font-bold text-[#1c648e] text-sm">
                  {patient.terapeutaPrincipal || 'Lic. Valeria Rivas'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-100 font-medium text-[11px]">
                  {patient.sala || 'Sala 2 - Estimulación Sensorial'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#cae6ff]/50 text-[#00496d] border border-sky-200 font-medium text-[11px]">
                  {patient.frecuencia || '2 sesiones / semana'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Clinical Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            {/* Diagnóstico */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Diagnóstico Clínico
                </span>
                <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
                  {patient.diagnosticoPrincipal}
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {patient.condicionesMedicas || 'Sin alergias reportadas'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tutor Legal */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-xs min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Tutor Legal ({patient.tutor.parentesco})
                </span>
                <p className="font-bold text-slate-800 mt-0.5 truncate">
                  {patient.tutor.nombreCompleto}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.tutor.telefono}</span>
                </div>
                {patient.tutor.email && (
                  <div className="mt-0.5 flex items-center gap-1.5 text-slate-500 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{patient.tutor.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contacto & Retiro */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Domicilio &amp; Retiro
                </span>
                <p className="font-medium text-slate-700 mt-0.5 text-[11px] line-clamp-2">
                  {patient.tutor.direccion || 'Av. San Borja Sur 450, Dpto 302, Lima'}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Autorizado para retiro
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones de Ingreso */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Observaciones Clínicas de Admisión
            </span>
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
              {patient.observacionesAdmision ||
                patient.antecedentes ||
                'Niño colaborador y sociable. Muestra notable entusiasmo frente a estímulos lúdicos manipulativos y pictogramas visuales interactivos. Evidencia mayor dificultad en la articulación de fonemas complejos.'}
            </div>
          </div>
        </section>

        {/* 2. Card: DOCUMENTOS CLÍNICOS Y ARCHIVOS ADJUNTOS (PDF) */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Documentos Clínicos y Archivos Adjuntos (PDF)
                </h2>
                <p className="text-xs text-slate-400">
                  Evaluaciones neurológicas, informes fonoaudiológicos y consentimientos digitalizados
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPdfUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#00496d] bg-[#cae6ff]/50 hover:bg-[#cae6ff] rounded-xl transition cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              <span>+ Adjuntar Nuevo PDF</span>
            </button>
          </div>

          {/* PDF Files Grid */}
          {docs.length === 0 ? (
            <div className="text-center py-8 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No hay documentos PDF adjuntos aún.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sube informes previos o valoraciones diagnósticas para completar el expediente.
              </p>
              <button
                type="button"
                onClick={() => setIsPdfUploadModalOpen(true)}
                className="mt-3 px-4 py-1.5 rounded-lg bg-[#1c648e] text-white text-xs font-medium cursor-pointer"
              >
                Subir primer PDF
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-soft-sm transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-[#00496d] bg-[#cae6ff]/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        PDF
                      </span>
                    </div>

                    <div>
                      <h4
                        className="text-xs font-bold text-slate-800 line-clamp-2 hover:text-sky-700 cursor-pointer"
                        onClick={() => setViewingPdf(doc)}
                      >
                        {doc.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        {doc.categoria}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                      <span>{doc.tamano}</span>
                      <span>{formatDate(doc.fechaSubida)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setViewingPdf(doc)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-medium transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Documento</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Simulated download
                        const element = document.createElement('a');
                        element.setAttribute('href', doc.url || '#');
                        element.setAttribute('download', doc.nombre);
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                      title="Descargar PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePatientPdf(patient.id, doc.id)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Eliminar PDF"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. Card: HISTORIAL CLÍNICO LONGITUDINAL (INTERVENCIONES) */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                Historial Clínico Longitudinal
              </h3>
              <p className="text-xs text-slate-400">
                Línea de tiempo de sesiones terapéuticas, actividades y notas de evolución
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 self-start sm:self-auto">
              {activities.length} Intervenciones Registradas
            </span>
          </div>

          <div className="space-y-4">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-soft-sm transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#cae6ff] text-[#001e30]">
                      {act.numeroProceso}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{act.titulo}</h4>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {act.duracionMinutos} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(act.fecha)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#1c648e] font-semibold">
                  <span>
                    Profesional: {act.terapeutaNombre} ({act.especialidad})
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 text-xs text-slate-700 leading-relaxed shadow-soft-sm">
                  <strong className="text-slate-900 block mb-1">
                    Desempeño y Proceso Clínico:
                  </strong>
                  {act.descripcion}
                </div>

                {act.observaciones && (
                  <div className="text-xs text-slate-500 bg-slate-100/60 p-2.5 rounded-lg">
                    <strong className="text-slate-700">Observaciones e Indicaciones Familiares: </strong>
                    {act.observaciones}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal: Subir Nuevo Documento PDF */}
      {isPdfUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Adjuntar Documento PDF al Expediente
                  </h3>
                  <span className="text-xs text-slate-400">
                    {patient.codigoExpediente} — {patient.nombreCompleto}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePdfSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Categoría del Documento
                </label>
                <select
                  value={pdfCategory}
                  onChange={(e) => setPdfCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 py-2.5 px-3 outline-none bg-white"
                >
                  <option value="Informe de Evolución">Informe de Evolución</option>
                  <option value="Evaluación Diagnóstica Inicial">Evaluación Diagnóstica Inicial</option>
                  <option value="Informe Médico Externo (Neurología/Pediatría)">
                    Informe Médico Externo (Neurología/Pediatría)
                  </option>
                  <option value="Consentimiento Informado / Legal">Consentimiento Informado / Legal</option>
                  <option value="Partida de Nacimiento / DNI">Partida de Nacimiento / DNI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nombre descriptivo del documento
                </label>
                <input
                  type="text"
                  placeholder="Ej. Evaluacion_Neuropsicologica_2026"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 py-2.5 px-3 outline-none"
                />
              </div>

              {/* Drag and Drop Box */}
              <div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handlePdfFileSelect(e.target.files)}
                />
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handlePdfFileSelect(e.dataTransfer.files);
                  }}
                  onClick={() => pdfInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-sky-500 bg-sky-50/50'
                      : pdfFile
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  {pdfFile ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-700 truncate">{pdfFile.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {(pdfFile.size / (1024 * 1024)).toFixed(1)} MB • Listo para subir
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Selecciona o arrastra tu archivo PDF
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Máx. 15MB en formato PDF</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPdfUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!pdfFile && !pdfTitle.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1c648e] hover:bg-[#00496d] rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  Subir al Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nueva Actividad Clínica */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Registrar Nueva Actividad Clínica
                </h3>
                <span className="text-xs text-slate-400">
                  Expediente {patient.codigoExpediente} — {patient.nombreCompleto}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Título de la Actividad / Sesión <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Integración sensorial y coordinación bimanual"
                  value={activityForm.titulo}
                  onChange={(e) => setActivityForm({ ...activityForm, titulo: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 py-2.5 px-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nº Proceso
                  </label>
                  <input
                    type="text"
                    required
                    value={activityForm.numeroProceso}
                    onChange={(e) => setActivityForm({ ...activityForm, numeroProceso: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 py-2 px-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={activityForm.duracionMinutos}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, duracionMinutos: Number(e.target.value) })
                    }
                    className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 py-2 px-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Descripción del Desempeño y Respuesta del Menor <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalla las actividades realizadas, respuesta motriz o lingüística, nivel de tolerancia y avances..."
                  value={activityForm.descripcion}
                  onChange={(e) => setActivityForm({ ...activityForm, descripcion: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 p-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Observaciones / Recomendaciones para el Hogar
                </label>
                <input
                  type="text"
                  placeholder="Pautas entregadas a la madre o terapeuta auxiliar..."
                  value={activityForm.observaciones || ''}
                  onChange={(e) => setActivityForm({ ...activityForm, observaciones: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 focus:border-sky-400 py-2.5 px-3 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1c648e] hover:bg-[#00496d] rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  Guardar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualizador Completo de PDF Clínico */}
      {viewingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Top Viewer Bar */}
            <div className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate max-w-md">{viewingPdf.nombre}</h3>
                  <span className="text-[11px] text-slate-400">
                    {patient.codigoExpediente} • {viewingPdf.categoria} • {viewingPdf.tamano}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Imprimir"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = viewingPdf.url || '#';
                    a.download = viewingPdf.nombre;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPdf(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Document Canvas / PDF Paper */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center">
              <div className="bg-white shadow-lg border border-slate-200 w-full max-w-2xl min-h-[700px] p-8 sm:p-12 text-slate-800 flex flex-col justify-between rounded-xl">
                <div>
                  {/* Document Header */}
                  <div className="flex items-center justify-between border-b-2 border-[#1c648e] pb-4 mb-6">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                        Centro de Estimulación Temprana Serenity
                      </h4>
                      <p className="text-xs text-slate-500">Módulo de Valoración y Seguimiento Clínico</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#00496d] bg-[#cae6ff] px-2.5 py-0.5 rounded-full">
                        {patient.codigoExpediente}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Fecha: {formatDate(viewingPdf.fechaSubida)}
                      </p>
                    </div>
                  </div>

                  {/* Document Meta Table */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs mb-6">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Paciente:
                      </span>
                      <span className="font-bold text-slate-800">{patient.nombreCompleto}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Edad Cronológica:
                      </span>
                      <span className="font-bold text-slate-800">{patient.edadTexto}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Especialista Responsable:
                      </span>
                      <span className="text-slate-700">
                        {patient.terapeutaPrincipal || 'Lic. Valeria Rivas'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Tipo de Documento:
                      </span>
                      <span className="text-[#00496d] font-semibold">{viewingPdf.categoria}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                    <h5 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-1">
                      1. RESUMEN CLÍNICO Y ANTECEDENTES
                    </h5>
                    <p>
                      El infante ingresa para valoración integral de hitos de desarrollo sensorio-motriz y
                      fonoarticulación. Durante la evaluación estandarizada se evidenció respuesta adecuada
                      a estímulos visuales interactivos y lúdicos, con necesidad de apoyo en fonemas consonánticos
                      complejos y modulación del tono postural.
                    </p>

                    <h5 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-1 pt-2">
                      2. CONCLUSIÓN Y PLAN DE TRABAJO
                    </h5>
                    <p>
                      Se recomienda la continuidad del plan terapéutico en <strong>{patient.sala || 'Sala 2'}</strong> a
                      razón de <strong>{patient.frecuencia || '2 sesiones por semana'}</strong>, complementando con
                      pautas dirigidas para la familia y seguimiento quincenal de evolución.
                    </p>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2 mt-4">
                      <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>
                        Documento oficial validado y archivado conforme a protocolos de confidencialidad clínica.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="pt-8 border-t border-slate-200 mt-10 flex items-center justify-between text-center text-xs">
                  <div>
                    <div className="w-40 border-b border-slate-400 mb-1 mx-auto"></div>
                    <p className="font-semibold text-slate-800">
                      {patient.terapeutaPrincipal || 'Lic. Valeria Rivas'}
                    </p>
                    <p className="text-[10px] text-slate-400">Especialista en Estimulación Temprana</p>
                  </div>
                  <div>
                    <div className="w-40 border-b border-slate-400 mb-1 mx-auto"></div>
                    <p className="font-semibold text-slate-800">{patient.tutor.nombreCompleto}</p>
                    <p className="text-[10px] text-slate-400">Tutor Legal ({patient.tutor.parentesco})</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;

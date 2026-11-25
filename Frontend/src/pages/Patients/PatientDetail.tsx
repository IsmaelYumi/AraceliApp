import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  FileCheck,
  Upload,
  Download,
  Trash2,
  Eye,
  ShieldCheck,
  FileUp,
  X,
  Printer,
  Sparkles,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Layers,
} from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import { uploadService } from '../../services/upload.service';
import { DEFAULT_BLANK_AVATAR } from '../../components/common/Avatar';
import type { CreateActividadDto, DocumentoPdf } from '../../types';

export interface PatientDetailProps {
  patientId: string;
  onBack: () => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ patientId, onBack }) => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const {
    getPatientById,
    getPatientActivities,
    addActivity,
    uploadPatientPdf,
    deletePatientPdf,
    updatePatient,
    deletePatient,
    isLoading,
  } = usePatients();

  const patient = getPatientById(patientId);
  const activities = getPatientActivities(patientId);

  // Status & Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingPatient, setIsDeletingPatient] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Modals state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<DocumentoPdf | null>(null);
  const [pdfViewTab, setPdfViewTab] = useState<'pdf' | 'pages' | 'ficha'>('pages');
  const [currentPdfPage, setCurrentPdfPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const getCloudinaryPageUrl = (url: string, page: number = 1): string => {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    if (!url.toLowerCase().endsWith('.pdf')) return url;
    return url
      .replace('/image/upload/', `/image/upload/pg_${page}/`)
      .replace(/\.pdf$/i, '.jpg');
  };

  const getCleanDocName = (nombre: string): string => {
    return (nombre || '').replace(/^\[INFORME\]\s*/i, '');
  };

  const handleOpenPdf = (doc: DocumentoPdf) => {
    setViewingPdf({
      ...doc,
      nombre: getCleanDocName(doc.nombre),
    });
    setCurrentPdfPage(1);
    setZoomLevel(1);
    if (doc.url && doc.url.includes('res.cloudinary.com')) {
      setPdfViewTab('pages');
    } else {
      setPdfViewTab('pdf');
    }
  };

  // Cálculo de siguiente número de proceso autoincrementable (PROC-01, PROC-02, ...)
  const nextProcessNumber = useMemo(() => {
    let maxNum = activities.length;
    for (const act of activities) {
      const match = act.numeroProceso?.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    return `PROC-${String(maxNum + 1).padStart(2, '0')}`;
  }, [activities]);

  // New activity form state
  const [activityForm, setActivityForm] = useState<CreateActividadDto>({
    pacienteId: patientId,
    titulo: '',
    numeroProceso: nextProcessNumber,
    duracionMinutos: 45,
    descripcion: '',
    observaciones: '',
  });

  // Mantener actualizado el número de proceso autoincrementable
  useEffect(() => {
    if (isActivityModalOpen) {
      setActivityForm((prev) => ({
        ...prev,
        pacienteId: patientId,
        numeroProceso: nextProcessNumber,
      }));
    }
  }, [isActivityModalOpen, nextProcessNumber, patientId]);

  // PDF upload state (Documentos Clínicos / Legales)
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfCategory, setPdfCategory] = useState('Informe de Evolución');
  const [pdfTitle, setPdfTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Informes del Centro upload state (Accesible para Terapeutas y Admin)
  const [isInformeUploadModalOpen, setIsInformeUploadModalOpen] = useState(false);
  const [informeTitle, setInformeTitle] = useState('');
  const [informeFile, setInformeFile] = useState<File | null>(null);
  const [isUploadingInforme, setIsUploadingInforme] = useState(false);
  const [isInformeDragging, setIsInformeDragging] = useState(false);
  const informeInputRef = useRef<HTMLInputElement>(null);

  // Cambiar estado del paciente (Sólo Administrador)
  const handleStatusChange = async (newStatus: 'ACTIVO' | 'INACTIVO' | 'EN_EVALUACION' | 'EGRESADO') => {
    if (!isAdmin || !patient) return;
    setIsUpdatingStatus(true);
    try {
      await updatePatient(patient.id, { estado: newStatus });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Eliminar paciente y sus registros en cascada (Sólo Administrador)
  const handleDeletePatient = async () => {
    if (!isAdmin || !patient) return;
    setIsDeletingPatient(true);
    try {
      const ok = await deletePatient(patient.id);
      if (ok) {
        setIsDeleteModalOpen(false);
        onBack();
      }
    } finally {
      setIsDeletingPatient(false);
    }
  };

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

    const payload: CreateActividadDto = {
      ...activityForm,
      numeroProceso: activityForm.numeroProceso || nextProcessNumber,
      terapeutaId: user?.terapeutaId || undefined,
      terapeutaNombre: user?.nombre || undefined,
      especialidad: user?.especialidad || undefined,
    };

    const created = await addActivity(payload);
    if (created) {
      setIsActivityModalOpen(false);
      setActivityForm({
        pacienteId: patientId,
        titulo: '',
        numeroProceso: '',
        duracionMinutos: 45,
        descripcion: '',
        observaciones: '',
      });
    }
  };

  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile && !pdfTitle.trim()) return;

    setIsUploadingPdf(true);
    let finalUrl = '#';

    try {
      if (pdfFile) {
        try {
          const uploadRes = await uploadService.upload(pdfFile);
          finalUrl = uploadRes.url;
        } catch (uploadErr) {
          console.warn('Upload to Cloudinary failed, using local blob URL as fallback', uploadErr);
          finalUrl = URL.createObjectURL(pdfFile);
        }
      }

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
        url: finalUrl,
      });

      setIsPdfUploadModalOpen(false);
      setPdfFile(null);
      setPdfTitle('');
    } finally {
      setIsUploadingPdf(false);
    }
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

  const handleInformeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!informeFile && !informeTitle.trim()) return;

    setIsUploadingInforme(true);
    let finalUrl = '#';

    try {
      if (informeFile) {
        try {
          const uploadRes = await uploadService.upload(informeFile);
          finalUrl = uploadRes.url;
        } catch (uploadErr) {
          console.warn('Upload to Cloudinary failed, using local blob URL as fallback', uploadErr);
          finalUrl = URL.createObjectURL(informeFile);
        }
      }

      let writtenName = informeTitle.trim();
      if (!writtenName && informeFile) {
        writtenName = informeFile.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim();
      }
      if (!writtenName) {
        writtenName = 'Informe del Centro';
      }

      const rawName = writtenName.toLowerCase().endsWith('.pdf')
        ? writtenName
        : `${writtenName}.pdf`;

      const filename = `[INFORME] ${rawName}`;
      const sizeStr = informeFile
        ? informeFile.size >= 1024 * 1024
          ? `${(informeFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(informeFile.size / 1024)} KB`
        : '1.2 MB';

      await uploadPatientPdf(patientId, {
        nombre: filename,
        tamano: sizeStr,
        categoria: 'Informe del Centro',
        url: finalUrl,
      });

      setIsInformeUploadModalOpen(false);
      setInformeFile(null);
      setInformeTitle('');
    } finally {
      setIsUploadingInforme(false);
    }
  };

  const handleInformeFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setInformeFile(file);
      // Solo sugerir nombre a partir del archivo si el campo de texto está vacío
      if (!informeTitle.trim()) {
        const suggested = file.name
          .replace(/\.pdf$/i, '')
          .replace(/[-_]/g, ' ')
          .trim();
        setInformeTitle(suggested);
      }
    }
  };

  const allDocs = patient.documentosPdf || [];
  const informesCentro = allDocs.filter((d) => d.nombre?.startsWith('[INFORME]'));
  const documentosAdjuntos = allDocs.filter((d) => !d.nombre?.startsWith('[INFORME]'));

  // Filtros de fecha para Informes del Centro
  const [informeStartDate, setInformeStartDate] = useState<string>('');
  const [informeEndDate, setInformeEndDate] = useState<string>('');

  const getDocDate = (doc: DocumentoPdf): string => {
    if (!doc.fechaSubida) return '';
    if (typeof doc.fechaSubida === 'string') {
      return doc.fechaSubida.split('T')[0];
    }
    try {
      return new Date(doc.fechaSubida).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const filteredInformes = useMemo(() => {
    return informesCentro.filter((doc) => {
      const docDate = getDocDate(doc);
      if (!docDate) return true;
      if (informeStartDate && docDate < informeStartDate) return false;
      if (informeEndDate && docDate > informeEndDate) return false;
      return true;
    });
  }, [informesCentro, informeStartDate, informeEndDate]);

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
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsPdfUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#00496d] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
              >
                <FileUp className="w-4 h-4 text-sky-600" />
                <span>Subir Documento Adjunto</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsInformeUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-emerald-600" />
              <span>Subir Informe del Centro</span>
            </button>
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#1c648e] hover:bg-[#00496d] rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Nota de Evolución</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
                title="Eliminar paciente y todos sus registros"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Eliminar Paciente</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Main Patient Summary Card */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={patient.avatarUrl || DEFAULT_BLANK_AVATAR}
                  alt={patient.nombreCompleto}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_BLANK_AVATAR;
                  }}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-sky-100 bg-slate-100"
                />
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    patient.estado === 'ACTIVO'
                      ? 'bg-emerald-500'
                      : patient.estado === 'INACTIVO'
                      ? 'bg-rose-500'
                      : patient.estado === 'EN_EVALUACION'
                      ? 'bg-amber-500'
                      : 'bg-purple-500'
                  }`}
                ></span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-[#001e30] bg-[#cae6ff] px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
                    {patient.codigoExpediente}
                  </span>
                  {patient.estado === 'ACTIVO' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Tratamiento Activo
                    </span>
                  )}
                  {patient.estado === 'INACTIVO' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      Inactivo
                    </span>
                  )}
                  {patient.estado === 'EN_EVALUACION' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      En Evaluación
                    </span>
                  )}
                  {patient.estado === 'EGRESADO' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      Egresado
                    </span>
                  )}
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
                <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-bold mb-1">
                  Estado del Expediente:
                </span>
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={patient.estado}
                      disabled={isUpdatingStatus}
                      onChange={async (e) => {
                        const newStatus = e.target.value as 'ACTIVO' | 'INACTIVO' | 'EN_EVALUACION' | 'EGRESADO';
                        await handleStatusChange(newStatus);
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1c648e] transition shadow-sm ${
                        patient.estado === 'ACTIVO'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : patient.estado === 'INACTIVO'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : patient.estado === 'EN_EVALUACION'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-purple-50 text-purple-800 border-purple-300'
                      }`}
                    >
                      <option value="ACTIVO">ACTIVO (En Tratamiento)</option>
                      <option value="INACTIVO">INACTIVO</option>
                      <option value="EN_EVALUACION">EN EVALUACIÓN</option>
                      <option value="EGRESADO">EGRESADO</option>
                    </select>
                    {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />}
                  </div>
                ) : (
                  <span
                    className={`font-bold text-xs px-2.5 py-1 rounded-lg border ${
                      patient.estado === 'ACTIVO'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : patient.estado === 'INACTIVO'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : patient.estado === 'EN_EVALUACION'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-purple-50 text-purple-800 border-purple-200'
                    }`}
                  >
                    {patient.estado}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-100 font-medium text-[11px]">
                  Grupo {patient.grupoSanguineo || 'O+'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#cae6ff]/50 text-[#00496d] border border-sky-200 font-medium text-[11px] capitalize">
                  {patient.genero || 'masculino'}
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
                    {patient.condicionesMedicas || 'Sin condiciones o alergias reportadas'}
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

            {/* Domicilio & Contacto */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Domicilio &amp; Ubicación
                </span>
                <p className="font-medium text-slate-700 mt-0.5 text-[11px] line-clamp-2">
                  {patient.tutor.direccion || 'Domicilio no especificado'}
                </p>
                {patient.segundoContacto && (
                  <div className="mt-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">Contacto 2:</span> {patient.segundoContacto.nombre} ({patient.segundoContacto.telefono})
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Antecedentes y Observaciones de Ingreso */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Antecedentes Clínicos y Perinatales
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs text-slate-700 leading-relaxed min-h-[70px]">
                {patient.antecedentes || 'Sin antecedentes específicos consignados.'}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Observaciones Clínicas de Admisión
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs text-slate-700 leading-relaxed min-h-[70px]">
                {patient.observacionesAdmision || 'Sin observaciones de admisión adicionales.'}
              </div>
            </div>
          </div>
        </section>

        {/* Banner de Estado Inactivo */}
        {patient.estado === 'INACTIVO' && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div className="flex-1">
              <span className="font-bold text-rose-950">Expediente Inactivo:</span> Este paciente se encuentra marcado actualmente como <strong className="uppercase">INACTIVO</strong>. Toda su información y documentos adjuntos se conservan de forma segura para archivo y consulta histórica.
            </div>
          </div>
        )}

        {/* 2. Card: DOCUMENTOS CLÍNICOS Y ARCHIVOS ADJUNTOS (PDF) */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Documentos Adjuntos (PDF)
                </h2>
                <p className="text-xs text-slate-400">
                  Evaluaciones neurológicas, informes fonoaudiológicos y consentimientos digitalizados
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsPdfUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#00496d] bg-[#cae6ff]/50 hover:bg-[#cae6ff] rounded-xl transition cursor-pointer"
              >
                <FileUp className="w-4 h-4" />
                <span>+ Adjuntar Nuevo PDF</span>
              </button>
            )}
          </div>

          {/* PDF Files Grid */}
          {documentosAdjuntos.length === 0 ? (
            <div className="text-center py-8 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No hay documentos PDF adjuntos aún.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAdmin
                  ? 'Sube informes previos o valoraciones diagnósticas para completar el expediente.'
                  : 'Este expediente no cuenta con documentos externos digitalizados cargados por la administración.'}
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsPdfUploadModalOpen(true)}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-[#1c648e] text-white text-xs font-medium cursor-pointer"
                >
                  Subir primer PDF
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentosAdjuntos.map((doc) => {
                const displayName = getCleanDocName(doc.nombre);
                return (
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
                          onClick={() => handleOpenPdf(doc)}
                        >
                          {displayName}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 font-medium">
                          {doc.categoria || 'Documento Adjunto'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                        <span>{doc.tamano}</span>
                        <span>{doc.fechaSubida ? formatDate(doc.fechaSubida) : 'Reciente'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenPdf(doc)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-medium transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Documento</span>
                      </button>
                      {doc.url && doc.url !== '#' && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-sky-100 text-sky-600 transition cursor-pointer"
                          title="Abrir en pestaña nueva"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const element = document.createElement('a');
                          element.setAttribute('href', doc.url || '#');
                          element.setAttribute('download', displayName);
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                        title="Descargar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de que deseas eliminar el documento "${displayName}" de este expediente?`)) {
                              deletePatientPdf(patient.id, doc.id || '');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Eliminar PDF"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. Card: INFORMES DEL CENTRO (PDF) - Accesible para Terapeutas y Admin */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-800">
                    Informes del Centro
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Terapeutas y Coordinación
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Informes de evolución terapéutica, valoraciones periódicas y reportes emitidos por el equipo del centro
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsInformeUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-emerald-600" />
              <span>+ Subir Informe del Centro</span>
            </button>
          </div>

          {/* Barra de Filtro por Fecha para Informes */}
          {informesCentro.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mr-1">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Filtrar por fecha:</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 font-medium">Desde:</span>
                  <input
                    type="date"
                    value={informeStartDate}
                    onChange={(e) => setInformeStartDate(e.target.value)}
                    className="text-xs text-slate-700 bg-transparent outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 font-medium">Hasta:</span>
                  <input
                    type="date"
                    value={informeEndDate}
                    onChange={(e) => setInformeEndDate(e.target.value)}
                    className="text-xs text-slate-700 bg-transparent outline-none cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const today = `${year}-${month}-${day}`;
                    setInformeStartDate(today);
                    setInformeEndDate(today);
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                    informeStartDate && informeStartDate === informeEndDate
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  title="Ver informes subidos hoy"
                >
                  Hoy
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const firstDay = `${year}-${month}-01`;
                    const lastDayNum = new Date(year, now.getMonth() + 1, 0).getDate();
                    const lastDay = `${year}-${month}-${String(lastDayNum).padStart(2, '0')}`;
                    setInformeStartDate(firstDay);
                    setInformeEndDate(lastDay);
                  }}
                  className="px-2 py-1 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  title="Ver informes de este mes"
                >
                  Este Mes
                </button>

                {(informeStartDate || informeEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setInformeStartDate('');
                      setInformeEndDate('');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
                    title="Quitar filtros de fecha"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 font-medium shrink-0">
                {filteredInformes.length === informesCentro.length ? (
                  <span>{informesCentro.length} informe{informesCentro.length !== 1 ? 's' : ''} en total</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">
                    Mostrando {filteredInformes.length} de {informesCentro.length} informes
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Informes Files Grid */}
          {informesCentro.length === 0 ? (
            <div className="text-center py-8 p-4 rounded-xl border border-dashed border-slate-200 bg-emerald-50/20">
              <FileCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No hay informes del centro subidos todavía.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Los terapeutas pueden adjuntar aquí los informes clínicos, avances semestrales y valoraciones del menor en formato PDF.
              </p>
              <button
                type="button"
                onClick={() => setIsInformeUploadModalOpen(true)}
                className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer shadow-sm transition"
              >
                Subir primer informe del centro
              </button>
            </div>
          ) : filteredInformes.length === 0 ? (
            <div className="text-center py-8 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No se encontraron informes en las fechas seleccionadas.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Prueba seleccionando otro rango de fechas o limpia el filtro para ver todos los informes de este paciente.
              </p>
              <button
                type="button"
                onClick={() => {
                  setInformeStartDate('');
                  setInformeEndDate('');
                }}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold cursor-pointer border border-emerald-200 transition"
              >
                Ver todos los informes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInformes.map((doc) => {
                const displayName = getCleanDocName(doc.nombre);
                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-emerald-100 bg-white hover:border-emerald-300 hover:shadow-soft-sm transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Informe del Centro
                        </span>
                      </div>

                      <div>
                        <h4
                          className="text-xs font-bold text-slate-800 line-clamp-2 hover:text-emerald-700 cursor-pointer"
                          onClick={() => handleOpenPdf(doc)}
                        >
                          {displayName}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                        <span>{doc.tamano}</span>
                        <span>{doc.fechaSubida ? formatDate(doc.fechaSubida) : 'Reciente'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenPdf(doc)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-medium transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Informe</span>
                      </button>
                      {doc.url && doc.url !== '#' && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-emerald-600 transition cursor-pointer"
                          title="Abrir en pestaña nueva"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const element = document.createElement('a');
                          element.setAttribute('href', doc.url || '#');
                          element.setAttribute('download', displayName);
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
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de que deseas eliminar el informe "${displayName}" de este expediente?`)) {
                            deletePatientPdf(patient.id, doc.id || '');
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Eliminar Informe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
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

      {/* Modal: Subir Nuevo Documento PDF (Exclusivo Administrador) */}
      {isAdmin && isPdfUploadModalOpen && (
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
                  <option value="Evaluación Diagnóstica Inicial">Evaluación Diagnóstica Inicial</option>
                  <option value="Informe Médico Externo (Neurología/Pediatría)">
                    Informe Médico Externo (Neurología/Pediatría)
                  </option>
                  <option value="Consentimiento Informado / Legal">Consentimiento Informado / Legal</option>
                  <option value="Partida de Nacimiento / DNI">Partida de Nacimiento / DNI</option>
                  <option value="Documento Clínico de Admisión">Documento Clínico de Admisión</option>
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
                  disabled={isUploadingPdf}
                  onClick={() => setIsPdfUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPdf || (!pdfFile && !pdfTitle.trim())}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#1c648e] hover:bg-[#00496d] rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isUploadingPdf && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploadingPdf ? 'Subiendo a Cloudinary...' : 'Subir al Expediente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Subir Informe del Centro (PDF) - Accesible para Terapeutas y Admin */}
      {isInformeUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Subir Informe del Centro (PDF)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Expediente {patient.codigoExpediente} — {patient.nombreCompleto}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInformeUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInformeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Informe <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Escribe el nombre del informe (ej. Informe de Estimulación Temprana y Lenguaje)"
                  value={informeTitle}
                  onChange={(e) => setInformeTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 focus:border-emerald-500 py-2.5 px-3 outline-none"
                  autoFocus
                />
              </div>

              {/* Drag and Drop Box */}
              <div>
                <input
                  ref={informeInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handleInformeFileSelect(e.target.files)}
                />
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsInformeDragging(true);
                  }}
                  onDragLeave={() => setIsInformeDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsInformeDragging(false);
                    handleInformeFileSelect(e.dataTransfer.files);
                  }}
                  onClick={() => informeInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                    isInformeDragging
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : informeFile
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  {informeFile ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-700 truncate">{informeFile.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {(informeFile.size / (1024 * 1024)).toFixed(1)} MB • Listo para subir
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Selecciona o arrastra el informe PDF del centro
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Máx. 15MB en formato PDF</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isUploadingInforme}
                  onClick={() => setIsInformeUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploadingInforme || (!informeFile && !informeTitle.trim())}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isUploadingInforme && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploadingInforme ? 'Subiendo a Cloudinary...' : 'Subir Informe del Centro'}</span>
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                    <span>Nº Proceso</span>
                    <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                      Autoincrementable
                    </span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={activityForm.numeroProceso || nextProcessNumber}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-mono font-bold py-2 px-3 outline-none cursor-default select-none shadow-inner"
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

      {/* Modal: Visualizador Completo de PDF Clínico (Cloudinary + Resumen) */}
      {viewingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
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

              {/* Mode Switcher Tabs */}
              <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPdfViewTab('pages')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    pdfViewTab === 'pages'
                      ? 'bg-[#1c648e] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Vista Páginas (HD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPdfViewTab('pdf')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    pdfViewTab === 'pdf'
                      ? 'bg-[#1c648e] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Visor PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPdfViewTab('ficha')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    pdfViewTab === 'ficha'
                      ? 'bg-[#1c648e] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Ficha Resumida</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {viewingPdf.url && viewingPdf.url !== '#' && (
                  <a
                    href={
                      pdfViewTab === 'pages'
                        ? getCloudinaryPageUrl(viewingPdf.url, currentPdfPage)
                        : viewingPdf.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition cursor-pointer"
                    title="Abrir en pestaña nueva"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Abrir en Pestaña</span>
                  </a>
                )}
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
                    const dlUrl =
                      pdfViewTab === 'pages'
                        ? getCloudinaryPageUrl(viewingPdf.url || '', currentPdfPage)
                        : viewingPdf.url || '#';
                    const a = document.createElement('a');
                    a.href = dlUrl;
                    a.download =
                      pdfViewTab === 'pages'
                        ? `${viewingPdf.nombre.replace(/\.pdf$/i, '')}_pag_${currentPdfPage}.jpg`
                        : viewingPdf.nombre;
                    a.target = '_blank';
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
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de que deseas eliminar el documento "${viewingPdf.nombre}" de este expediente?`)) {
                      deletePatientPdf(patient.id, viewingPdf.id || '');
                      setViewingPdf(null);
                    }
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 transition cursor-pointer"
                  title="Eliminar PDF"
                >
                  <Trash2 className="w-4 h-4" />
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

            {/* Viewer Content: Pages View, PDF iframe or Clinical Sheet */}
            {pdfViewTab === 'pages' && viewingPdf.url && viewingPdf.url !== '#' ? (
              <div className="flex-1 w-full h-full bg-slate-900 flex flex-col overflow-hidden">
                {/* Page Controls Toolbar */}
                <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-2.5 flex items-center justify-between text-xs text-white shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPdfPage <= 1}
                      onClick={() => setCurrentPdfPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Página Anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold px-2.5 py-1 rounded-md bg-slate-900 text-sky-400 border border-slate-700">
                      Página {currentPdfPage}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPdfPage((p) => p + 1)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition cursor-pointer"
                      title="Página Siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition cursor-pointer"
                      title="Reducir Zoom"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] text-slate-300 w-12 text-center font-mono">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition cursor-pointer"
                      title="Aumentar Zoom"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[10px] text-slate-300 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="hidden md:flex items-center gap-2 text-slate-400 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Renderizado HD por Cloudinary</span>
                  </div>
                </div>

                {/* Page Image Container */}
                <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/60">
                  <div
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="shadow-2xl rounded-lg overflow-hidden bg-white max-w-full"
                  >
                    <img
                      src={getCloudinaryPageUrl(viewingPdf.url, currentPdfPage)}
                      alt={`Página ${currentPdfPage} - ${viewingPdf.nombre}`}
                      className="max-w-full h-auto block select-none"
                    />
                  </div>
                </div>
              </div>
            ) : pdfViewTab === 'pdf' && viewingPdf.url && viewingPdf.url !== '#' ? (
              <div className="flex-1 w-full h-full bg-slate-900 flex flex-col relative">
                {/* Cloudinary Security Notice */}
                {viewingPdf.url.includes('res.cloudinary.com') && (
                  <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        ¿El PDF no carga o muestra error de permisos? Cloudinary bloquea la entrega directa de archivos .pdf por defecto. Puedes usar la pestaña <strong>"Vista Páginas (HD)"</strong> para verlo de inmediato, o activar <em>"Allow delivery of PDF and ZIP files"</em> en la consola de Cloudinary (Settings &gt; Security).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfViewTab('pages')}
                      className="ml-3 px-3 py-1 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-white font-semibold text-[11px] shrink-0 transition cursor-pointer"
                    >
                      Cambiar a Vista Páginas
                    </button>
                  </div>
                )}
                <iframe
                  src={viewingPdf.url}
                  title={viewingPdf.nombre}
                  className="w-full flex-1 border-0 bg-white"
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center">
                <div className="bg-white shadow-lg border border-slate-200 w-full max-w-2xl min-h-[700px] p-8 sm:p-12 text-slate-800 flex flex-col justify-between rounded-xl">
                  <div>
                    {/* Document Header */}
                    <div className="flex items-center justify-between border-b-2 border-[#1c648e] pb-4 mb-6">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                          Centro de Estimulación Temprana
                        </h4>
                        <p className="text-xs text-slate-500">Módulo de Valoración y Seguimiento Clínico</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#00496d] bg-[#cae6ff] px-2.5 py-0.5 rounded-full">
                          {patient.codigoExpediente}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Fecha: {viewingPdf.fechaSubida ? formatDate(viewingPdf.fechaSubida) : 'Reciente'}
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
                          Equipo Multidisciplinario
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
                        {patient.antecedentes ||
                          'El infante ingresa para valoración integral de hitos de desarrollo sensorio-motriz y fonoarticulación. Durante la evaluación estandarizada se evidenció respuesta adecuada a estímulos visuales interactivos y lúdicos.'}
                      </p>

                      <h5 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-1 pt-2">
                        2. OBSERVACIONES DE INGRESO Y PLAN
                      </h5>
                      <p>
                        {patient.observacionesAdmision ||
                          'Se recomienda el seguimiento integral del plan de estimulación temprana, complementando con pautas dirigidas para la familia y seguimiento periódico de evolución.'}
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
                        Coordinación Clínica
                      </p>
                      <p className="text-[10px] text-slate-400">Atención Pediátrica Especializada</p>
                    </div>
                    <div>
                      <div className="w-40 border-b border-slate-400 mb-1 mx-auto"></div>
                      <p className="font-semibold text-slate-800">{patient.tutor.nombreCompleto}</p>
                      <p className="text-[10px] text-slate-400">Tutor Legal ({patient.tutor.parentesco})</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal de Confirmación para Eliminar Paciente */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">¿Eliminar Paciente?</h3>
                <span className="text-xs font-semibold text-rose-600">Esta acción no se puede deshacer</span>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-900 space-y-2">
              <p className="font-semibold">
                Se eliminará permanentemente a <strong className="text-rose-950 font-bold">{patient.nombreCompleto}</strong> ({patient.codigoExpediente}).
              </p>
              <p className="text-[11px] leading-relaxed text-rose-800">
                Al confirmar, se borrará toda su información asociada:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-800">
                <li>Todos los documentos adjuntos y PDFs clínicos ({allDocs.length} archivo(s))</li>
                <li>Historial completo de notas de evolución ({activities.length} registro(s))</li>
                <li>Citas agendadas y programadas</li>
                <li>Información de tutores y contactos de emergencia</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingPatient}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingPatient}
                onClick={handleDeletePatient}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isDeletingPatient ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Eliminando todo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Eliminar Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;

import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Baby,
  Phone,
  FileText,
  FileUp,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/feedback/EmptyState';
import { usePatients } from '../../hooks/usePatients';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';
import { PatientCreate } from './PatientCreate';
import type { Paciente } from '../../types';

export interface PatientsDirectoryProps {
  onSelectPatient: (patientId: string) => void;
  onCreatePatient?: () => void;
  canCreatePatient?: boolean;
}

export const PatientsDirectory: React.FC<PatientsDirectoryProps> = ({
  onSelectPatient,
  onCreatePatient,
  canCreatePatient,
}) => {
  const { user } = useAuth();
  const isAdmin = canCreatePatient !== undefined ? canCreatePatient : user?.rol === 'ADMIN';
  const { patients, isLoading, createPatient, deletePatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO' | 'EN_EVALUACION' | 'EGRESADO'>('TODOS');
  const [patientToDelete, setPatientToDelete] = useState<Paciente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 200);
  const [isCreating, setIsCreating] = useState(false);

  const counts = useMemo(() => {
    return {
      todos: patients.length,
      activos: patients.filter((p) => p.estado === 'ACTIVO').length,
      inactivos: patients.filter((p) => p.estado === 'INACTIVO').length,
      evaluacion: patients.filter((p) => p.estado === 'EN_EVALUACION').length,
      egresados: patients.filter((p) => p.estado === 'EGRESADO').length,
    };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (statusFilter !== 'TODOS' && p.estado !== statusFilter) {
        return false;
      }
      const term = debouncedSearch.toLowerCase();
      if (!term) return true;
      return (
        p.nombreCompleto.toLowerCase().includes(term) ||
        p.codigoExpediente.toLowerCase().includes(term) ||
        p.diagnosticoPrincipal.toLowerCase().includes(term) ||
        p.tutor.nombreCompleto.toLowerCase().includes(term)
      );
    });
  }, [patients, debouncedSearch, statusFilter]);

  const handleConfirmDelete = async () => {
    if (!isAdmin || !patientToDelete) return;
    setIsDeleting(true);
    try {
      const ok = await deletePatient(patientToDelete.id);
      if (ok) {
        setPatientToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartCreate = () => {
    if (!isAdmin) return;
    if (onCreatePatient) {
      onCreatePatient();
    } else {
      setIsCreating(true);
    }
  };

  // If in create mode and user is admin, display the full PatientCreate view
  if (isCreating && isAdmin) {
    return (
      <PatientCreate
        onBack={() => setIsCreating(false)}
        nextExpedienteCode={`CET-${2048 + patients.length}`}
        onSubmit={async (dto) => {
          const created = await createPatient(dto);
          if (created) {
            setIsCreating(false);
            onSelectPatient(created.id);
            return created.id;
          }
          return null;
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#00496d]">
              Directorio Clínico - Centro de Estimulación Temprana
            </span>
            <span className="font-bold text-[#001e30] bg-[#cae6ff] px-2 py-0.5 rounded-full text-xs">
              {filteredPatients.length} {filteredPatients.length === 1 ? 'Expediente' : 'Expedientes'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Expedientes Infantiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fichas pediátricas, documentación adjunta en PDF y seguimiento de estimulación temprana.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="md"
            onClick={handleStartCreate}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="bg-[#1c648e] hover:bg-[#00496d] shadow-sm text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer"
          >
            Registrar Nuevo Paciente
          </Button>
        )}
      </div>

      {/* Search Bar & Status Filters */}
      <Card className="p-4 shadow-soft-sm border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full flex-1">
            <Input
              placeholder="Buscar por nombre del menor, expediente (CET-...), diagnóstico o tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'TODOS'
                ? 'bg-[#1c648e] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
            }`}
          >
            <span>Todos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'TODOS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.todos}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVO')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'ACTIVO'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-emerald-50 bg-emerald-50/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Activos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'ACTIVO' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {counts.activos}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('INACTIVO')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'INACTIVO'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 hover:bg-rose-50 bg-rose-50/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Inactivos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'INACTIVO' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {counts.inactivos}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('EN_EVALUACION')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'EN_EVALUACION'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-700 hover:bg-amber-50 bg-amber-50/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>En Evaluación</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'EN_EVALUACION' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {counts.evaluacion}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('EGRESADO')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'EGRESADO'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-700 hover:bg-purple-50 bg-purple-50/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Egresados</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'EGRESADO' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
              }`}
            >
              {counts.egresados}
            </span>
          </button>
        </div>
      </Card>

      {/* Patient Cards Grid */}
      {filteredPatients.length === 0 && !isLoading ? (
        <EmptyState
          title="No se encontraron pacientes"
          description={
            isAdmin
              ? "Verifica los términos de búsqueda o registra un nuevo paciente en el centro."
              : "No se encontraron expedientes pediátricos con el criterio de búsqueda especificado."
          }
          actionText={isAdmin ? "Registrar Paciente" : undefined}
          onAction={isAdmin ? handleStartCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((paciente) => {
            const pdfCount = paciente.documentosPdf?.length || 0;

            return (
              <Card
                key={paciente.id}
                hoverable
                className="p-6 flex flex-col justify-between border border-slate-100 shadow-soft-sm hover:shadow-soft-hover rounded-2xl bg-white"
              >
                <div>
                  {/* Card Top: Avatar, Code, Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={paciente.avatarUrl}
                        alt={paciente.nombreCompleto}
                        size="md"
                        rounded="2xl"
                        className="ring-2 ring-sky-100/80"
                      />
                      <div>
                        <span className="font-bold text-[#001e30] bg-[#cae6ff] px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider inline-block mb-0.5">
                          {paciente.codigoExpediente}
                        </span>
                        <h3 className="font-bold text-base text-slate-800 leading-snug">
                          {paciente.nombreCompleto}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                          {paciente.edadTexto}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        paciente.estado === 'ACTIVO'
                          ? 'success'
                          : paciente.estado === 'INACTIVO'
                          ? 'danger'
                          : paciente.estado === 'EN_EVALUACION'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                      dot
                    >
                      {paciente.estado === 'ACTIVO'
                        ? 'Activo'
                        : paciente.estado === 'INACTIVO'
                        ? 'Inactivo'
                        : paciente.estado === 'EN_EVALUACION'
                        ? 'Evaluación'
                        : 'Egresado'}
                    </Badge>
                  </div>

                  {/* Diagnosis snippet */}
                  <div className="p-3 rounded-xl bg-slate-50 mb-3 border border-slate-100/80">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Diagnóstico Clínico
                    </p>
                    <p className="text-xs text-slate-700 font-medium mt-0.5 line-clamp-2 leading-relaxed">
                      {paciente.diagnosticoPrincipal}
                    </p>
                  </div>

                  {/* PDF attachments & therapist pills */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {pdfCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                        <FileText className="w-3 h-3 text-rose-500" />
                        {pdfCount} {pdfCount === 1 ? 'PDF adjunto' : 'PDFs adjuntos'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] text-slate-400 bg-slate-50 border border-slate-100">
                        <FileUp className="w-3 h-3" />
                        Sin PDFs
                      </span>
                    )}

                    {paciente.grupoSanguineo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] text-slate-600 bg-slate-50 border border-slate-100">
                        {paciente.grupoSanguineo}
                      </span>
                    )}
                  </div>

                  {/* Tutor legal info */}
                  <div className="space-y-1 text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-2">
                      <Baby className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">
                        Tutor:{' '}
                        <strong className="text-slate-700">
                          {paciente.tutor.nombreCompleto}
                        </strong>{' '}
                        ({paciente.tutor.parentesco})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{paciente.tutor.telefono}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button: Ver Expediente & Eliminar Paciente (Admin) */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => onSelectPatient(paciente.id)}
                    leftIcon={<FileText className="w-4 h-4 text-[#1c648e]" />}
                    className="border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-700 hover:text-[#00496d] font-semibold cursor-pointer rounded-xl flex-1"
                  >
                    Ver Expediente
                  </Button>
                  {isAdmin && (
                    <button
                      type="button"
                      title="Eliminar paciente y registros asociados"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPatientToDelete(paciente);
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Paciente */}
      {patientToDelete && (
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
                Se eliminará permanentemente a <strong className="text-rose-950 font-bold">{patientToDelete.nombreCompleto}</strong> ({patientToDelete.codigoExpediente}).
              </p>
              <p className="text-[11px] leading-relaxed text-rose-800">
                Al confirmar, se borrará toda su información asociada:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-800">
                <li>Todos los documentos adjuntos y PDFs clínicos ({patientToDelete.documentosPdf?.length || 0} archivo(s))</li>
                <li>Historial de notas de evolución y actividades clínicas</li>
                <li>Citas agendadas y programadas</li>
                <li>Información de tutores y contactos</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
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

export default PatientsDirectory;

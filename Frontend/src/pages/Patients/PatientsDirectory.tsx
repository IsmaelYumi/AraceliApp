import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Baby,
  Phone,
  FileText,
  FileUp,
  MapPin,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { usePatients } from '../../hooks/usePatients';
import { useDebounce } from '../../hooks/useDebounce';
import { PatientCreate } from './PatientCreate';

export interface PatientsDirectoryProps {
  onSelectPatient: (patientId: string) => void;
  onCreatePatient?: () => void;
}

export const PatientsDirectory: React.FC<PatientsDirectoryProps> = ({
  onSelectPatient,
  onCreatePatient,
}) => {
  const { patients, isLoading, createPatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 200);
  const [isCreating, setIsCreating] = useState(false);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const term = debouncedSearch.toLowerCase();
      return (
        p.nombreCompleto.toLowerCase().includes(term) ||
        p.codigoExpediente.toLowerCase().includes(term) ||
        p.diagnosticoPrincipal.toLowerCase().includes(term) ||
        p.tutor.nombreCompleto.toLowerCase().includes(term)
      );
    });
  }, [patients, debouncedSearch]);

  const handleStartCreate = () => {
    if (onCreatePatient) {
      onCreatePatient();
    } else {
      setIsCreating(true);
    }
  };

  // If in create mode, display the full PatientCreate view matching the user's template
  if (isCreating) {
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
              Directorio Clínico Serenity
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

        <Button
          variant="primary"
          size="md"
          onClick={handleStartCreate}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="bg-[#1c648e] hover:bg-[#00496d] shadow-sm text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer"
        >
          Registrar Nuevo Paciente
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4 shadow-soft-sm border-slate-100">
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
      </Card>

      {/* Patient Cards Grid */}
      {filteredPatients.length === 0 && !isLoading ? (
        <EmptyState
          title="No se encontraron pacientes"
          description="Verifica los términos de búsqueda o registra un nuevo paciente en el centro."
          actionText="Registrar Paciente"
          onAction={handleStartCreate}
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
                      {paciente.avatarUrl ? (
                        <img
                          src={paciente.avatarUrl}
                          alt={paciente.nombreCompleto}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-sky-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-100 to-indigo-100 text-[#00496d] font-bold text-sm flex items-center justify-center shadow-soft-sm">
                          {paciente.nombres[0]}
                          {paciente.apellidos[0]}
                        </div>
                      )}
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
                      variant={paciente.estado === 'ACTIVO' ? 'success' : 'warning'}
                      size="sm"
                      dot
                    >
                      {paciente.estado === 'ACTIVO' ? 'Activo' : 'Evaluación'}
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

                    {paciente.sala && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] text-slate-600 bg-slate-50 border border-slate-100 truncate max-w-[150px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {paciente.sala.split('-')[0]}
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

                {/* Action Button: Ver Expediente */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => onSelectPatient(paciente.id)}
                    leftIcon={<FileText className="w-4 h-4 text-[#1c648e]" />}
                    className="border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-700 hover:text-[#00496d] font-semibold cursor-pointer rounded-xl"
                  >
                    Ver Expediente &amp; Historial
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientsDirectory;

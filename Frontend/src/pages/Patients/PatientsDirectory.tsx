import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Baby,
  Phone,
  FileText,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { usePatients } from '../../hooks/usePatients';
import { useDebounce } from '../../hooks/useDebounce';
import { useModal } from '../../hooks/useModal';
import type { CreatePacienteDto } from '../../types';

export interface PatientsDirectoryProps {
  onSelectPatient: (patientId: string) => void;
}

export const PatientsDirectory: React.FC<PatientsDirectoryProps> = ({ onSelectPatient }) => {
  const { patients, isLoading, createPatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 200);
  const registerModal = useModal<void>();

  // Register Patient form state
  const [formData, setFormData] = useState<CreatePacienteDto>({
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    diagnosticoPrincipal: '',
    tutor: {
      nombreCompleto: '',
      parentesco: 'Madre',
      telefono: '',
      email: '',
    },
    antecedentes: '',
    terapeutaPrincipal: 'Lic. Claudia Morales',
  });

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres.trim() || !formData.apellidos.trim()) return;

    const created = await createPatient(formData);
    if (created) {
      registerModal.close();
      setFormData({
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        diagnosticoPrincipal: '',
        tutor: {
          nombreCompleto: '',
          parentesco: 'Madre',
          telefono: '',
          email: '',
        },
        antecedentes: '',
        terapeutaPrincipal: 'Lic. Claudia Morales',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-serenity-700">
              Directorio Clínico
            </span>
            <Badge variant="neutral" size="sm">
              {filteredPatients.length} {filteredPatients.length === 1 ? 'Paciente' : 'Pacientes'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Expedientes Infantiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fichas pediátricas y seguimiento de estimulación temprana.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => registerModal.open()}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Registrar Nuevo Paciente
        </Button>
      </div>

      {/* Search Bar - Clean & Borderless with soft shadow */}
      <Card className="p-4 shadow-soft-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full flex-1">
            <Input
              placeholder="Buscar por nombre del menor, expediente o diagnóstico..."
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
          onAction={() => registerModal.open()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((paciente) => (
            <Card
              key={paciente.id}
              hoverable
              className="p-6 flex flex-col justify-between border-none shadow-soft-sm hover:shadow-soft-hover"
            >
              <div>
                {/* Card Top: Avatar, Code, Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-serenity-100 to-mint-100 text-serenity-700 font-bold text-sm flex items-center justify-center shadow-soft-sm">
                      {paciente.nombres[0]}
                      {paciente.apellidos[0]}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-serenity-700 block">
                        {paciente.codigoExpediente}
                      </span>
                      <h3 className="font-bold text-base text-slate-800 leading-snug">
                        {paciente.nombreCompleto}
                      </h3>
                      <span className="text-xs text-slate-500">{paciente.edadTexto}</span>
                    </div>
                  </div>
                  <Badge variant={paciente.estado === 'ACTIVO' ? 'success' : 'warning'} size="sm" dot>
                    {paciente.estado === 'ACTIVO' ? 'Activo' : 'Evaluación'}
                  </Badge>
                </div>

                {/* Diagnosis snippet */}
                <div className="p-3 rounded-xl bg-slate-50 mb-4">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Diagnóstico</p>
                  <p className="text-xs text-slate-700 font-medium mt-0.5 line-clamp-2 leading-relaxed">
                    {paciente.diagnosticoPrincipal}
                  </p>
                </div>

                {/* Tutor legal info */}
                <div className="space-y-1.5 text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-2">
                    <Baby className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Tutor: <strong className="text-slate-700">{paciente.tutor.nombreCompleto}</strong> ({paciente.tutor.parentesco})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{paciente.tutor.telefono}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Ver Expediente */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => onSelectPatient(paciente.id)}
                  leftIcon={<FileText className="w-4 h-4 text-serenity-600" />}
                >
                  Ver Expediente
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* REGISTRO DE PACIENTE MODAL */}
      <Modal
        isOpen={registerModal.isOpen}
        onClose={registerModal.close}
        size="lg"
        title="Registrar Nuevo Paciente Pediátrico"
        description="Ficha de admisión infantil y contacto con tutores legales"
        footer={
          <>
            <Button variant="secondary" onClick={registerModal.close}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleRegisterSubmit}
              isLoading={isLoading}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Guardar Expediente
            </Button>
          </>
        }
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna 1: Datos del Menor */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-serenity-800 pb-1 border-b border-slate-100">
                1. Datos del Menor
              </h4>
              <Input
                label="Nombres del Menor"
                placeholder="Ej. Lucas Daniel"
                required
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              />
              <Input
                label="Apellidos"
                placeholder="Ej. Gómez Peralta"
                required
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              />
              <Input
                label="Fecha de Nacimiento"
                type="date"
                required
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
              />
              <Input
                label="Diagnóstico / Motivo de Consulta"
                placeholder="Ej. Retraso en la articulación del habla..."
                required
                value={formData.diagnosticoPrincipal}
                onChange={(e) => setFormData({ ...formData, diagnosticoPrincipal: e.target.value })}
              />
            </div>

            {/* Columna 2: Tutor Legal y Contacto */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-serenity-800 pb-1 border-b border-slate-100">
                2. Tutor Legal y Contacto
              </h4>
              <Input
                label="Nombre Completo del Tutor"
                placeholder="Ej. Andrea Peralta Rojas"
                required
                value={formData.tutor.nombreCompleto}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tutor: { ...formData.tutor, nombreCompleto: e.target.value },
                  })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Parentesco</label>
                  <select
                    value={formData.tutor.parentesco}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tutor: { ...formData.tutor, parentesco: e.target.value as any },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 outline-none focus:border-serenity-500"
                  >
                    <option value="Madre">Madre</option>
                    <option value="Padre">Padre</option>
                    <option value="Tutor Legal">Tutor Legal</option>
                    <option value="Abuelo/a">Abuelo/a</option>
                  </select>
                </div>
                <Input
                  label="Teléfono / WhatsApp"
                  placeholder="+52 55..."
                  required
                  value={formData.tutor.telefono}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tutor: { ...formData.tutor, telefono: e.target.value },
                    })
                  }
                />
              </div>
              <Input
                label="Correo Electrónico del Tutor"
                type="email"
                placeholder="tutor@ejemplo.com"
                value={formData.tutor.email || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tutor: { ...formData.tutor, email: e.target.value },
                  })
                }
              />
              <Input
                label="Antecedentes Médicos (Opcional)"
                placeholder="Prematuridad, antecedentes relevantes..."
                value={formData.antecedentes || ''}
                onChange={(e) => setFormData({ ...formData, antecedentes: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientsDirectory;

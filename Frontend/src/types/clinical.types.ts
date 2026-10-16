export type EspecialidadTerapeutica =
  | 'Estimulación Temprana'
  | 'Fonoaudiología'
  | 'Terapia Ocupacional'
  | 'Psicomotricidad'
  | 'Psicología Infantil';

export interface TutorLegal {
  nombreCompleto: string;
  parentesco: 'Madre' | 'Padre' | 'Tutor Legal' | 'Abuelo/a' | string;
  dni?: string;
  telefono: string;
  email?: string;
  direccion?: string;
  autorizadoRetiro?: boolean;
}

export interface DocumentoPdf {
  id: string;
  nombre: string;
  tamano: string;
  fechaSubida: string;
  categoria: string;
  url?: string;
  subidoPor?: string;
}

export interface Paciente {
  id: string;
  codigoExpediente: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  edadTexto: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  grupoSanguineo?: string;
  diagnosticoPrincipal: string;
  sala?: string;
  frecuencia?: string;
  condicionesMedicas?: string;
  observacionesAdmision?: string;
  tutor: TutorLegal;
  segundoContacto?: {
    nombre: string;
    parentesco: string;
    telefono: string;
  };
  antecedentes?: string;
  fechaIngreso: string;
  avatarUrl?: string;
  estado: 'ACTIVO' | 'EN_EVALUACION' | 'EGRESADO';
  terapeutaPrincipal?: string;
  documentosPdf?: DocumentoPdf[];
}

export interface CreatePacienteDto {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  grupoSanguineo?: string;
  diagnosticoPrincipal: string;
  sala?: string;
  frecuencia?: string;
  condicionesMedicas?: string;
  observacionesAdmision?: string;
  tutor: TutorLegal;
  segundoContacto?: {
    nombre: string;
    parentesco: string;
    telefono: string;
  };
  antecedentes?: string;
  terapeutaPrincipal?: string;
  avatarUrl?: string;
  documentosPdf?: DocumentoPdf[];
}

export interface ActividadClinica {
  id: string;
  pacienteId: string;
  terapeutaId: string;
  terapeutaNombre: string;
  especialidad: EspecialidadTerapeutica | string;
  titulo: string;
  numeroProceso: string;
  duracionMinutos: number;
  fecha: string;
  descripcion: string;
  observaciones?: string;
  revisado: boolean;
}

export interface CreateActividadDto {
  pacienteId: string;
  titulo: string;
  numeroProceso: string;
  duracionMinutos: number;
  descripcion: string;
  observaciones?: string;
}

export interface Terapeuta {
  id: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  especialidad: EspecialidadTerapeutica | string;
  cedulaProfesional: string;
  telefono: string;
  email: string;
  fechaIngreso: string;
  enfoqueClinico?: string;
  avatarUrl?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface CreateTerapeutaDto {
  nombres: string;
  apellidos: string;
  cedulaProfesional: string;
  fechaIngreso: string;
  especialidad: EspecialidadTerapeutica | string;
  telefono: string;
  email: string;
  enfoqueClinico?: string;
}

export interface Cita {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteEdad?: string;
  terapeutaId: string;
  terapeutaNombre: string;
  tipoTerapia: EspecialidadTerapeutica | string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // e.g. "09:00"
  horaFin: string; // e.g. "09:45"
  notas?: string;
  estado: 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA';
}

export interface CreateCitaDto {
  pacienteId: string;
  terapeutaId: string;
  tipoTerapia: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  notas?: string;
}

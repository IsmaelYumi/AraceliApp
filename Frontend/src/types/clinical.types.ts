export type EspecialidadTerapeutica =
  | 'Estimulación Temprana'
  | 'Fonoaudiología'
  | 'Terapia Ocupacional'
  | 'Psicomotricidad'
  | 'Psicología Infantil';

export interface TutorLegal {
  nombreCompleto: string;
  parentesco: string;
  dni?: string;
  telefono: string;
  email?: string;
  direccion?: string;
}

export interface SegundoContacto {
  nombre: string;
  parentesco: string;
  telefono: string;
}

export interface DocumentoPdf {
  id?: string;
  nombre: string;
  tamano: string;
  fechaSubida?: string;
  categoria?: string;
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
  condicionesMedicas?: string;
  observacionesAdmision?: string;
  antecedentes?: string;
  avatarUrl?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'EN_EVALUACION' | 'EGRESADO';
  fechaIngreso: string;
  tutor: TutorLegal;
  segundoContacto?: SegundoContacto;
  documentosPdf?: DocumentoPdf[];
}

export interface CreatePacienteDto {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  grupoSanguineo?: string;
  diagnosticoPrincipal: string;
  condicionesMedicas?: string;
  observacionesAdmision?: string;
  antecedentes?: string;
  avatarUrl?: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'EN_EVALUACION' | 'EGRESADO';
  tutor: TutorLegal;
  segundoContacto?: SegundoContacto;
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
  terapeutaId?: string;
  terapeutaNombre?: string;
  especialidad?: string;
  titulo: string;
  numeroProceso: string;
  duracionMinutos: number;
  descripcion: string;
  observaciones?: string;
  revisado?: boolean;
}

export interface Terapeuta {
  id: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  especialidad: string;
  cedulaProfesional: string;
  telefono: string;
  email: string;
  fechaIngreso: string;
  avatarUrl?: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  usuarioId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTerapeutaDto {
  nombres: string;
  apellidos: string;
  especialidad: string;
  cedulaProfesional: string;
  telefono: string;
  email: string;
  fechaIngreso?: string;
  avatarUrl?: string | null;
  estado?: 'ACTIVO' | 'INACTIVO';
  password?: string;
}

export interface UpdateTerapeutaDto extends Partial<CreateTerapeutaDto> {}

export interface Cita {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteExpediente?: string;
  pacienteDiagnostico?: string;
  pacienteAvatar?: string | null;
  pacienteEdad?: string;
  terapeutaId: string;
  terapeutaNombre: string;
  tipoTerapia?: EspecialidadTerapeutica | string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // e.g. "09:00"
  horaFin: string; // e.g. "09:45"
  notas?: string;
  estado: 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA';
}

export interface CreateCitaDto {
  pacienteId: string;
  terapeutaId?: string;
  tipoTerapia?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  notas?: string;
}

export interface FilterCitaDto {
  fecha?: string;
  pacienteId?: string;
  terapeutaId?: string;
  estado?: 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA';
}

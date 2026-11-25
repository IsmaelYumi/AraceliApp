import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  Paciente,
  CreatePacienteDto,
  ActividadClinica,
  CreateActividadDto,
  QueryFilterParams,
} from '../types';

export const patientService = {
  /**
   * Obtener todos los pacientes
   */
  async getAll(params?: QueryFilterParams): Promise<Paciente[]> {
    const response = await axiosClient.get<Paciente[]>(API_ENDPOINTS.PACIENTES.BASE, { params });
    return response.data;
  },

  /**
   * Obtener expediente por ID
   */
  async getById(id: string): Promise<Paciente> {
    const response = await axiosClient.get<Paciente>(API_ENDPOINTS.PACIENTES.BY_ID(id));
    return response.data;
  },

  /**
   * Registrar nuevo paciente
   */
  async create(data: CreatePacienteDto): Promise<Paciente> {
    const response = await axiosClient.post<Paciente>(API_ENDPOINTS.PACIENTES.BASE, data);
    return response.data;
  },

  /**
   * Actualizar expediente o estado del paciente
   */
  async update(id: string, data: Partial<CreatePacienteDto>): Promise<Paciente> {
    const response = await axiosClient.patch<Paciente>(API_ENDPOINTS.PACIENTES.BY_ID(id), data);
    return response.data;
  },

  /**
   * Eliminar paciente y todos sus registros asociados
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await axiosClient.delete<{ message: string }>(API_ENDPOINTS.PACIENTES.BY_ID(id));
    return response.data;
  },

  /**
   * Obtener historial clínico / actividades del paciente
   */
  async getActivities(pacienteId: string): Promise<ActividadClinica[]> {
    const response = await axiosClient.get<ActividadClinica[]>(
      API_ENDPOINTS.PACIENTES.ACTIVIDADES(pacienteId)
    );
    return response.data;
  },

  /**
   * Registrar nueva actividad clínica
   */
  async addActivity(data: CreateActividadDto): Promise<ActividadClinica> {
    const response = await axiosClient.post<ActividadClinica>(
      API_ENDPOINTS.PACIENTES.ACTIVIDADES(data.pacienteId),
      data
    );
    return response.data;
  },

  /**
   * Adjuntar documento PDF al expediente del paciente
   */
  async addDocument(pacienteId: string, data: { nombre: string; tamano: string; url?: string }): Promise<any> {
    const response = await axiosClient.post(
      API_ENDPOINTS.PACIENTES.DOCUMENTOS(pacienteId),
      data
    );
    return response.data;
  },

  /**
   * Eliminar documento PDF del expediente
   */
  async deleteDocument(pacienteId: string, docId: string): Promise<any> {
    const response = await axiosClient.delete(
      API_ENDPOINTS.PACIENTES.DOCUMENTO_BY_ID(pacienteId, docId)
    );
    return response.data;
  },
};

export default patientService;

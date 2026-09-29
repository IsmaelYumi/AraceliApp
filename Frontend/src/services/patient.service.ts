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
};

export default patientService;

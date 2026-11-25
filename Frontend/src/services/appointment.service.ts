import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { Cita, CreateCitaDto, FilterCitaDto } from '../types';

export const appointmentService = {
  /**
   * Obtener todas las citas usando FilterCitaDto
   */
  async getAll(params?: FilterCitaDto): Promise<Cita[]> {
    const response = await axiosClient.get<Cita[]>(API_ENDPOINTS.CITAS.BASE, { params });
    return response.data;
  },

  /**
   * Obtener citas por fecha específica
   */
  async getByDate(date: string): Promise<Cita[]> {
    const response = await axiosClient.get<Cita[]>(API_ENDPOINTS.CITAS.BY_DATE(date));
    return response.data;
  },

  /**
   * Agendar nueva cita
   */
  async create(data: CreateCitaDto): Promise<Cita> {
    const response = await axiosClient.post<Cita>(API_ENDPOINTS.CITAS.BASE, data);
    return response.data;
  },

  /**
   * Cancelar o actualizar estado de cita
   */
  async updateStatus(id: string, estado: Cita['estado']): Promise<Cita> {
    const response = await axiosClient.patch<Cita>(`${API_ENDPOINTS.CITAS.BASE}/${id}/status`, { estado });
    return response.data;
  },

  /**
   * Eliminar cita
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`${API_ENDPOINTS.CITAS.BASE}/${id}`);
  },
};

export default appointmentService;

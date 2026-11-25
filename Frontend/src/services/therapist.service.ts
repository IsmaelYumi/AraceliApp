import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { Terapeuta, CreateTerapeutaDto, QueryFilterParams } from '../types';

export const therapistService = {
  /**
   * Obtener directorio de terapeutas
   */
  async getAll(params?: QueryFilterParams): Promise<Terapeuta[]> {
    const response = await axiosClient.get<Terapeuta[]>(API_ENDPOINTS.TERAPEUTAS.BASE, { params });
    return response.data;
  },

  /**
   * Obtener expediente del terapeuta
   */
  async getById(id: string): Promise<Terapeuta> {
    const response = await axiosClient.get<Terapeuta>(API_ENDPOINTS.TERAPEUTAS.BY_ID(id));
    return response.data;
  },

  /**
   * Registrar nuevo terapeuta en el sistema (la cédula profesional es asignada como su contraseña)
   */
  async create(data: CreateTerapeutaDto): Promise<Terapeuta> {
    const payload = {
      ...data,
      password: (data.password || data.cedulaProfesional || '').trim(),
    };
    const response = await axiosClient.post<Terapeuta>(API_ENDPOINTS.TERAPEUTAS.BASE, payload);
    return response.data;
  },

  /**
   * Actualizar datos del terapeuta
   */
  async update(id: string, data: Partial<CreateTerapeutaDto>): Promise<Terapeuta> {
    const response = await axiosClient.patch<Terapeuta>(API_ENDPOINTS.TERAPEUTAS.BY_ID(id), data);
    return response.data;
  },

  /**
   * Eliminar o desactivar terapeuta
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await axiosClient.delete<{ message: string }>(API_ENDPOINTS.TERAPEUTAS.BY_ID(id));
    return response.data;
  },
};

export default therapistService;

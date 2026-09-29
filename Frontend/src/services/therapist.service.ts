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
   * Registrar nuevo terapeuta en el sistema
   */
  async create(data: CreateTerapeutaDto): Promise<Terapeuta> {
    const response = await axiosClient.post<Terapeuta>(API_ENDPOINTS.TERAPEUTAS.BASE, data);
    return response.data;
  },
};

export default therapistService;

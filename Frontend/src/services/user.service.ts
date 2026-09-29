import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { User, CreateUserDto, UpdateUserDto, UserStatus, QueryFilterParams } from '../types';

/**
 * Service to manage User API interactions.
 * Completely decoupled from React components and UI presentation.
 */
export const userService = {
  /**
   * Fetch all users with optional query parameters (filters, pagination)
   */
  async getAll(params?: QueryFilterParams): Promise<User[]> {
    const response = await axiosClient.get<User[]>(API_ENDPOINTS.USUARIOS.BASE, { params });
    return response.data;
  },

  /**
   * Fetch a single user by ID
   */
  async getById(id: string): Promise<User> {
    const response = await axiosClient.get<User>(API_ENDPOINTS.USUARIOS.BY_ID(id));
    return response.data;
  },

  /**
   * Create a new user
   */
  async create(payload: CreateUserDto): Promise<User> {
    const response = await axiosClient.post<User>(API_ENDPOINTS.USUARIOS.BASE, payload);
    return response.data;
  },

  /**
   * Update an existing user
   */
  async update(id: string, payload: UpdateUserDto): Promise<User> {
    const response = await axiosClient.patch<User>(API_ENDPOINTS.USUARIOS.BY_ID(id), payload);
    return response.data;
  },

  /**
   * Update user status (e.g. ACTIVE, INACTIVE)
   */
  async updateStatus(id: string, estado: UserStatus): Promise<User> {
    const response = await axiosClient.patch<User>(API_ENDPOINTS.USUARIOS.STATUS(id), { estado });
    return response.data;
  },

  /**
   * Delete a user by ID
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.USUARIOS.BY_ID(id));
  },
};

export default userService;

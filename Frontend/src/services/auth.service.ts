import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/endpoints';
import { APP_CONFIG } from '../constants/config';
import { storage } from '../utils/storage';
import type { LoginCredentials, AuthResponse, User, CreateUserDto } from '../types';

/**
 * Service to manage Authentication API requests.
 */
export const authService = {
  /**
   * Log in user and persist token/user info
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    const { accessToken, user } = response.data;
    
    storage.set(APP_CONFIG.TOKEN_STORAGE_KEY, accessToken);
    storage.set(APP_CONFIG.USER_STORAGE_KEY, user);
    
    return response.data;
  },

  /**
   * Register a new user
   */
  async register(data: CreateUserDto): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  /**
   * Fetch authenticated user's profile
   */
  async getProfile(): Promise<User> {
    const response = await axiosClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  /**
   * Log out user and clear stored session
   */
  async logout(): Promise<void> {
    try {
      await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore network errors on logout
    } finally {
      storage.remove(APP_CONFIG.TOKEN_STORAGE_KEY);
      storage.remove(APP_CONFIG.USER_STORAGE_KEY);
    }
  },

  /**
   * Check if current session exists in storage
   */
  getStoredAuth(): { token: string | null; user: User | null } {
    return {
      token: storage.get<string>(APP_CONFIG.TOKEN_STORAGE_KEY),
      user: storage.get<User>(APP_CONFIG.USER_STORAGE_KEY),
    };
  },
};

export default authService;

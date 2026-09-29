import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '../constants/config';
import { storage } from '../utils/storage';
import type { ApiError } from '../types/api.types';

export const axiosClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if present
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string>(APP_CONFIG.TOKEN_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error formatting and handle global auth states
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: 'Ocurrió un error inesperado en la comunicación con el servidor',
      statusCode: error.response?.status || 500,
      error: error.message,
    };

    if (error.response?.data && typeof error.response.data === 'object') {
      const responseData = error.response.data as Record<string, unknown>;
      if (typeof responseData.message === 'string') {
        apiError.message = responseData.message;
      } else if (Array.isArray(responseData.message)) {
        apiError.message = responseData.message.join(', ');
      }
      if (typeof responseData.error === 'string') {
        apiError.error = responseData.error;
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      storage.remove(APP_CONFIG.TOKEN_STORAGE_KEY);
      storage.remove(APP_CONFIG.USER_STORAGE_KEY);
    }

    return Promise.reject(apiError);
  }
);

export default axiosClient;

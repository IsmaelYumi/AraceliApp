export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
  },
  USUARIOS: {
    BASE: '/usuarios',
    BY_ID: (id: string | number) => `/usuarios/${id}`,
    STATUS: (id: string | number) => `/usuarios/${id}/status`,
  },
  PACIENTES: {
    BASE: '/pacientes',
    BY_ID: (id: string | number) => `/pacientes/${id}`,
    ACTIVIDADES: (id: string | number) => `/pacientes/${id}/actividades`,
    DOCUMENTOS: (id: string | number) => `/pacientes/${id}/documentos`,
    DOCUMENTO_BY_ID: (id: string | number, docId: string | number) => `/pacientes/${id}/documentos/${docId}`,
  },
  TERAPEUTAS: {
    BASE: '/terapeutas',
    BY_ID: (id: string | number) => `/terapeutas/${id}`,
  },
  CITAS: {
    BASE: '/citas',
    BY_DATE: (date: string) => `/citas?fecha=${date}`,
    BY_ID: (id: string | number) => `/citas/${id}`,
  },
  UPLOAD: '/upload',
} as const;

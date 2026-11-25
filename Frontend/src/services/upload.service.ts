import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/endpoints';

export interface UploadResponse {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  originalName: string;
  resourceType: string;
}

export const uploadService = {
  /**
   * Sube un archivo (imagen o documento PDF) a Cloudinary a través del backend
   */
  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.post<UploadResponse>(
      API_ENDPOINTS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  },
};

export default uploadService;

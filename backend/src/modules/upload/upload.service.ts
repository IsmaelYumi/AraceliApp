import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, type UploadApiResponse, type UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'node:stream';
import 'multer';

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  originalName: string;
  resourceType: string;
}

@Injectable()
export class UploadService {
  /**
   * Sube una imagen o documento PDF a Cloudinary mediante streaming
   */
  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo para subir.');
    }

    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');
    const isImage = file.mimetype.startsWith('image/');

    if (!isPdf && !isImage) {
      throw new BadRequestException(
        'Formato no permitido. Solo se pueden subir imágenes (JPG, PNG, WebP) o documentos PDF.',
      );
    }

    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
    );

    // Fallback si aún no se han configurado las variables de entorno de Cloudinary
    if (!isCloudinaryConfigured) {
      console.warn(
        '⚠️ Cloudinary no está completamente configurado en .env. Se usará codificación Data URL temporal.',
      );
      const base64 = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64}`;
      return {
        url: dataUrl,
        publicId: `temp_${Date.now()}`,
        format: file.mimetype.split('/')[1] || (isPdf ? 'pdf' : 'jpg'),
        bytes: file.size,
        originalName: file.originalname,
        resourceType: isPdf ? 'raw' : 'image',
      };
    }

    const folder = isPdf ? 'araceli_app/documentos_pdf' : 'araceli_app/fotos';
    const resourceType = isPdf ? 'auto' : 'image';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(
              new BadRequestException(
                error?.message || 'Error al subir el archivo a Cloudinary.',
              ),
            );
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format || (isPdf ? 'pdf' : 'jpg'),
            bytes: result.bytes,
            originalName: file.originalname,
            resourceType: result.resource_type,
          });
        },
      );

      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }
}

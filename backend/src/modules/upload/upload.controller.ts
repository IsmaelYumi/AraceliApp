import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { UploadService, type UploadResult } from './upload.service.js';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Endpoint de subida de archivos (Imágenes y PDFs) a Cloudinary
   * POST /api/upload
   * Form-Data: file=<archivo>
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20 * 1024 * 1024, // Máximo 20 MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResult> {
    return this.uploadService.uploadFile(file);
  }
}

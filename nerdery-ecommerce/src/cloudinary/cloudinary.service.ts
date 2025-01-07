import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    try {
      return new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      throw new UnprocessableEntityException(
        `Error uploading image to Cloudinary: ${error.message}`,
      );
    }
  }
}

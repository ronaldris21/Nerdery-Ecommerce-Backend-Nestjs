import { v2 as cloudinary, ConfigOptions } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  //TODO: NOT SURE ABOUT THIS, type just added
  useFactory: (): ConfigOptions => {
    return cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  },
};

import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { VariationImage } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';

import { CloudinaryService } from '../../common/modules/cloudinary/cloudinary.service';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly idValidatorService: IdValidatorService,
  ) {}

  async uploadFile(productVariationId: string, file: Express.Multer.File): Promise<VariationImage> {
    const prodVariation = await this.idValidatorService.findUniqueProductVariationById({
      id: productVariationId,
    });

    if (!file.mimetype.startsWith('image/')) {
      throw new UnprocessableEntityException('File must be an image');
    }

    const result = await this.cloudinaryService.uploadFile(file);

    const image = await this.prismaService.variationImage.create({
      data: {
        productVariationId: prodVariation.id,
        imageUrl: result.secure_url,
      },
    });

    return image;
  }
}

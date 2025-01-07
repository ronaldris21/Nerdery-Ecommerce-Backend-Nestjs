import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from 'src/common/common.module';
import { CloudinaryModule } from 'src/common/modules/cloudinary/cloudinary.module';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  imports: [CommonModule, ConfigModule, CloudinaryModule],
  controllers: [ImagesController],
  providers: [ImagesService, PrismaService],
})
export class ImagesModule {}

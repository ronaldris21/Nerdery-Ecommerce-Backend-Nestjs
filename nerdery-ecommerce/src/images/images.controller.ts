import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decoratos/roles.decorator';
import { AccessTokenWithRolesGuard } from 'src/auth/guards/access-token-with-roles.guard';
import { ROLES } from 'src/common/constants';
import { HttpExceptionFilter } from 'src/graphql/exception-filters/http-exception/http-exception.filter';

import { ImagesService } from './images.service';

@Controller('images')
@UseFilters(new HttpExceptionFilter())
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('product-variations/:productVariationId')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  async uploadFile(
    @Param('productVariationId') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('file', file);
    return this.imagesService.uploadFile(id, file);
  }
}

import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ProductLikesResolver } from './product-likes.resolver';
import { ProductLikesService } from './product-likes.service';

@Module({
  providers: [ProductLikesResolver, ProductLikesService],
  imports: [CommonModule],
})
export class ProductLikesModule {}

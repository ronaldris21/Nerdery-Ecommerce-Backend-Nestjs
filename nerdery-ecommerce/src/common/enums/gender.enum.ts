import { registerEnumType } from '@nestjs/graphql';
import { GenderEnum } from '@prisma/client';

export { GenderEnum as Gender };

registerEnumType(GenderEnum, { name: 'Gender' });

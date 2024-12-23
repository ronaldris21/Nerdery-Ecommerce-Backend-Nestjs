import { registerEnumType } from '@nestjs/graphql';

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    UNISEX = 'UNISEX',
    KIDS = 'KIDS',
}

registerEnumType(Gender, { name: 'Gender' });

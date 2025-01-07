import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GenericResponseObject {
  @Field()
  message: string;
  @Field()
  statusCode: number;
}

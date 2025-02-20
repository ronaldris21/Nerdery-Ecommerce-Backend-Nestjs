import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

//TODO: CHECK THIS IF I'M GOING TO USE A LIBRARY??
// npm install  @nestjs/graphql graphql graphql-scalars

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'DateTime custom scalar type';

  parseValue(value: string): Date {
    return new Date(value); // from client
  }

  serialize(value: Date): string {
    return value.toISOString(); // to client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
}

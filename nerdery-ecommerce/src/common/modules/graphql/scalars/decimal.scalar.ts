import { CustomScalar, Scalar } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { Kind, ValueNode } from 'graphql';

// npm install decimal.js @nestjs/graphql graphql graphql-scalars

export type CustomDecimal = Decimal;

@Scalar('Decimal', () => Decimal)
export class DecimalScalar implements CustomScalar<number, CustomDecimal> {
  description = 'Decimal custom scalar type';

  parseValue(value: string): CustomDecimal {
    return new Decimal(value); // from client
  }

  serialize(value: CustomDecimal): number {
    return value.toNumber(); // to client
  }

  parseLiteral(ast: ValueNode): CustomDecimal {
    if (ast.kind === Kind.STRING) {
      return new Decimal(ast.value);
    }
    throw new Error('Decimal scalar supports only string values.');
  }
}

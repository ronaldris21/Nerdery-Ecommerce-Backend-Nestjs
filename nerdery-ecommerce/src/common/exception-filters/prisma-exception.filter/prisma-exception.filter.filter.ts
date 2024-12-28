import {
  Catch,
  ConflictException,
  GatewayTimeoutException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { GraphQLFormattedError } from 'graphql';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements GqlExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError): GraphQLFormattedError {
    // TODO: LOGGER
    // console.log('\n\n PrismaClientExceptionFilter');
    // console.log('exception', exception);

    switch (exception.code) {
      case 'P2002':
        throw new ConflictException(
          `The field(s) ${(exception.meta?.target as string[]).join(', ')} must be unique.`,
        );
      case 'P2003':
        throw new UnprocessableEntityException('A related entity does not exist.');
      case 'P2004':
        throw new UnprocessableEntityException('A constraint failed on the database.');
      case 'P2005':
        throw new UnprocessableEntityException(
          `Invalid value provided for the field: ${exception.meta?.field_name || 'unknown'}.`,
        );
      case 'P2006':
        throw new UnprocessableEntityException(
          'The provided value for the field is invalid. Please check your input.',
        );
      case 'P2007':
        throw new UnprocessableEntityException('Data validation error occurred.');
      case 'P2011':
        throw new UnprocessableEntityException(
          `Null constraint violation on the field: ${exception.meta?.field_name || 'unknown'}.`,
        );
      case 'P2012':
        throw new UnprocessableEntityException(
          `Missing required value for the field: ${exception.meta?.field_name || 'unknown'}.`,
        );
      case 'P2013':
        throw new UnprocessableEntityException(
          'Relational constraint failed. Ensure related entities exist.',
        );
      case 'P2015':
        throw new NotFoundException('Record not found or access denied.');
      case 'P2024':
        throw new GatewayTimeoutException('Operation timed out. Please try again later.');
      case 'P2025':
        throw new NotFoundException('The requested resource could not be found.');
      case 'P2030':
        throw new InternalServerErrorException(
          'Cannot connect to the database. Please check your connection settings.',
        );
      default:
        throw new InternalServerErrorException('An unexpected database error occurred.');
    }
  }
}

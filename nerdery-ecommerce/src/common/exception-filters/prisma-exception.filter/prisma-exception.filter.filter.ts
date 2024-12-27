import {
  BadRequestException,
  Catch,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { GraphQLFormattedError } from 'graphql';
import { GenericErrorDto } from 'src/common/dto/generic-error.dto';

function formatGraphQLError({
  message,
  error,
  statusCode,
}: GenericErrorDto): GraphQLFormattedError {
  const timestamp = new Date().toISOString();
  return {
    message,
    extensions: {
      error,
      statusCode,
      timestamp,
    },
  };
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements GqlExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError): GraphQLFormattedError {
    console.log('\n\n PrismaClientExceptionFilter');
    console.log('exception', exception);
    this.getCustomError(exception);

    // return formatGraphQLError({
    //   message: originalError.message,
    //   error: originalError.error,
    //   statusCode: originalError.statusCode,
    // });
  }

  private getCustomError(exception: Prisma.PrismaClientKnownRequestError): never {
    switch (exception.code) {
      case 'P2002':
        throw new ConflictException(
          `The field(s) ${(exception.meta?.target as string[]).join(', ')} must be unique.`,
        );
      case 'P2003':
        throw new UnprocessableEntityException('A related entity does not exist.');
      case 'P2004':
        throw new BadRequestException('A constraint failed on the database.');
      case 'P2005':
        throw new BadRequestException(
          `Invalid value provided for the field: ${exception.meta?.field_name || 'unknown'}.`,
        );
      case 'P2006':
        throw new BadRequestException(
          'The provided value for the field is invalid. Please check your input.',
        );
      case 'P2007':
        throw new BadRequestException('Data validation error occurred.');
      case 'P2008':
        throw new InternalServerErrorException(
          'Failed to parse the query. Please verify your query syntax.',
        );
      case 'P2009':
        throw new BadRequestException(
          'Failed to validate the query. Ensure your query structure is correct.',
        );
      case 'P2010':
        throw new InternalServerErrorException(
          'Raw query failed. Please check the query and database.',
        );
      case 'P2011':
        throw new BadRequestException(
          `Null constraint violation on the field: ${exception.meta?.field_name || 'unknown'}.`,
        );
      case 'P2012':
        throw new BadRequestException(
          `Missing required value for the field: ${exception.meta?.field_name || 'unknown'}.`,
        );
      case 'P2013':
        throw new BadRequestException(
          'Relational constraint failed. Ensure related entities exist.',
        );
      case 'P2014':
        throw new InternalServerErrorException(
          'Multiple errors occurred on the database constraint.',
        );
      case 'P2015':
        throw new NotFoundException('Record not found or access denied.');
      case 'P2016':
        throw new InternalServerErrorException(
          'Query interpretation error. Check your query logic.',
        );
      case 'P2017':
        throw new InternalServerErrorException('The records for the query are inconsistent.');
      case 'P2021':
        throw new InternalServerErrorException(
          'Table not found in the database. Please verify your schema.',
        );
      case 'P2022':
        throw new InternalServerErrorException(
          `Column not found: ${exception.meta?.column_name || 'unknown'}.`,
        );
      case 'P2023':
        throw new InternalServerErrorException('Inconsistent database schema detected.');
      case 'P2024':
        throw new GatewayTimeoutException('Operation timed out. Please try again later.');
      case 'P2025':
        throw new NotFoundException('The requested resource could not be found.');
      case 'P2026':
        throw new InternalServerErrorException(
          'The current database does not support the requested operation.',
        );
      case 'P2027':
        throw new InternalServerErrorException(
          'Multiple errors occurred while executing the database operation.',
        );
      case 'P2028':
        throw new InternalServerErrorException(
          'Transaction failed. Please check the underlying operations.',
        );
      case 'P2030':
        throw new InternalServerErrorException(
          'Cannot connect to the database. Please check your connection settings.',
        );
      case 'P2031':
        throw new ForbiddenException('Insufficient permissions for the requested operation.');
      case 'P2033':
        throw new ConflictException('Transaction failed due to deadlock.');
      default:
        throw new InternalServerErrorException('An unexpected database error occurred.');
    }
  }
}

// @Catch(Prisma.PrismaClientKnownRequestError)
// export class PrismaClientExceptionFilter implements GqlExceptionFilter {
//   catch(exception: Prisma.PrismaClientKnownRequestError): GraphQLFormattedError {
//     const originalError = this.getCustomError(exception);
//     console.log('\n\n PrismaClientExceptionFilter');
//     console.log('\n\n exception', exception);
//     console.log('\n\n originalError', originalError);

//     return formatGraphQLError({
//       message: originalError.message,
//       error: originalError.error,
//       statusCode: originalError.statusCode,
//     });
//   }

//   private getCustomError(exception: Prisma.PrismaClientKnownRequestError): GenericErrorDto {
//     switch (exception.code) {
//       case 'P2002':
//         return {
//           message: `The field(s) ${(exception.meta?.target as string[]).join(', ')} must be unique.`,
//           error: 'Conflict',
//           statusCode: 409,
//         };
//       case 'P2003':
//         return {
//           message: 'A related entity does not exist.',
//           error: 'UnprocessableEntity',
//           statusCode: 422,
//         };
//       case 'P2025':
//         return {
//           message: 'The requested resource could not be found.',
//           error: 'NotFound',
//           statusCode: 404,
//         };
//       default:
//         return {
//           message: 'An unexpected database error occurred.',
//           error: 'InternalServerError',
//           statusCode: 500,
//         };
//     }
//   }
// }

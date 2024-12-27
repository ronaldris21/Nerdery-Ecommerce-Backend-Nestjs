import { Catch } from '@nestjs/common';
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
    const originalError = this.getCustomError(exception);
    console.log('\n\n PrismaClientExceptionFilter');
    console.log('\n\n exception', exception);
    console.log('\n\n originalError', originalError);

    return formatGraphQLError({
      message: originalError.message,
      error: originalError.error,
      statusCode: originalError.statusCode,
    });
  }

  private getCustomError(exception: Prisma.PrismaClientKnownRequestError): GenericErrorDto {
    switch (exception.code) {
      case 'P2002':
        return {
          message: `The field(s) ${(exception.meta?.target as string[]).join(', ')} must be unique.`,
          error: 'Conflict',
          statusCode: 409,
        };
      case 'P2003':
        return {
          message: 'A related entity does not exist.',
          error: 'UnprocessableEntity',
          statusCode: 422,
        };
      case 'P2025':
        return {
          message: 'The requested resource could not be found.',
          error: 'NotFound',
          statusCode: 404,
        };
      default:
        return {
          message: 'An unexpected database error occurred.',
          error: 'InternalServerError',
          statusCode: 500,
        };
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

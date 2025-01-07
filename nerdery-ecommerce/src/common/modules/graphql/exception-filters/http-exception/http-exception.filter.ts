import {
  ArgumentsHost,
  Catch,
  ContextType,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  MethodNotAllowedException,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Request } from 'express';
import { GraphQLError } from 'graphql';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name); // Logger de NestJS

  catch(exception: HttpException, host: ArgumentsHost): void {
    const contextType = host.getType() as ContextType;

    if (contextType === ('graphql' as ContextType)) {
      this.handleGraphQLContext(exception, host);
    } else if (contextType === 'http') {
      this.handleHttpContext(exception, host);
    } else {
      this.logger.warn(`Unsupported context type: ${contextType}`);
      throw new MethodNotAllowedException('Only HTTP or GRAPHQL');
    }
  }

  private handleGraphQLContext(exception: HttpException, host: ArgumentsHost): never {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();

    const status = this.getStatus(exception);
    const exceptionResponse = this.getExceptionResponse(exception);

    const { message, code } = this.parseExceptionResponse(exception, exceptionResponse);

    this.logger.error(`GraphQL Error in field "${info.fieldName}": ${message}`, exception.stack);

    throw new GraphQLError(message, {
      extensions: {
        code,
        status,
        timestamp: new Date().toISOString(),
        fieldName: info.fieldName,
      },
    });
  }

  private handleHttpContext(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    const status = this.getStatus(exception);

    const exceptionResponse = exception.getResponse ? exception.getResponse() : exception.message;

    const responseBody =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse, error: 'BadRequest', statusCode: 400 }
        : exceptionResponse;

    this.logger.error(
      `HTTP Error for ${request.method} ${request.url}: ${(responseBody as any).message || exception.message}`,
      exception.stack,
    );

    return response.status(status).json({
      ...responseBody,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getStatus(exception: HttpException): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getExceptionResponse(exception: HttpException): unknown {
    return exception instanceof HttpException ? exception.getResponse() : 'Server Error';
  }

  private parseExceptionResponse(
    exception: HttpException,
    exceptionResponse: unknown,
  ): { message: string; code: string } {
    let finalMessage = exception.message;
    let finalCode = 'INTERNAL_SERVER_ERROR';

    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as Record<string, any>;

      // Class Validator case => Message Array
      if (Array.isArray(responseObj.message)) {
        finalMessage = responseObj.message.join(', ');
      } else {
        finalMessage = responseObj.message || exception.message;
      }

      finalCode = responseObj.error ?? 'INTERNAL_SERVER_ERROR';
    } else if (typeof exceptionResponse === 'string') {
      finalMessage = exceptionResponse;
    }

    return {
      message: finalMessage,
      code: finalCode,
    };
  }
}

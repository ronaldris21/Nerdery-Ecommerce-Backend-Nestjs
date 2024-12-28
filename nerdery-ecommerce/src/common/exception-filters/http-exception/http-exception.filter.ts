import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

// @Catch()
// export class HttpExceptionFilter<T> implements ExceptionFilter {
//   catch(exception: T, host: ArgumentsHost) {}
// }

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();
    const responseBody =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse, error: 'BadRequest', statusCode: 400 }
        : exceptionResponse;

    response.status(status).json({
      ...responseBody,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}

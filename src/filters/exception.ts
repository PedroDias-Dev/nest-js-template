import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as sentry from '@sentry/node';
import { ICurrentUser } from 'modules/common/interfaces/currentUser';
import { NODE_ENV, SENTRY_DSN } from 'settings';

sentry.init({
  dsn: SENTRY_DSN,
  environment: NODE_ENV
  // release: VERSION
});

Error.prepareStackTrace = err => {
  return err.stack
    .split('\n')
    .filter(x => !x.includes('node_modules'))
    .join('\n');
};

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
  public catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      sentry.withScope(scope => {
        scope.setExtras({
          req: {
            method: request.method,
            url: request.url,
            queryString: request.params,
            body: request.body
          }
        });

        const user: ICurrentUser = (request as any).user;
        if (user) {
          scope.setUser({ id: user.id.toString(), email: user.email, username: user.email });
        }

        scope.setTag('url', request.url);

        const error: Error = exception.originalError || exception;
        sentry.captureException(error);
      });
    }

    const custom = new HttpException(
      {
        ...exception.message,
        message: exception.message.message || this.defaultMessages(exception)
      },
      status
    );

    super.catch(custom, host);
  }

  private defaultMessages(exception: any): string {
    switch (exception.message.error) {
      case 'Bad Request':
        return 'Houve um erro ao processar a sua requisição, tente novamente mais tarde.';
      case 'Unauthorized':
        return 'Você não tem permissão para acessar este recurso.';
      case 'Forbidden':
        return 'Você não tem permissão para acessar este recurso.';
      case 'Not Found':
        return 'O recurso solicitado não foi encontrado.';
      case 'Internal Server Error':
        return 'Houve um erro interno no servidor, tente novamente mais tarde.';
      case 'Conflict':
        return 'Já existe um recurso com os dados informados.';

      default:
        return exception.message.error;
    }
  }
}

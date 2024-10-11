import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ErrorHandlingService } from '../services/error-handling.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private _errorHandlerService: ErrorHandlingService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.accessToken}`,
        },
      });
    }

    // const csrfToken = this.csrfTokenService.getToken();
    // if (csrfToken) {
    //   request = request.clone({
    //     setHeaders: {
    //       'X-XSRF-TOKEN': csrfToken,
    //     },
    //   });
    // }

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {}),
      catchError((error: HttpErrorResponse) => {
        this._errorHandlerService.handleError(error);
        return throwError(() => error);
      }),
      finalize(() => {})
    );
  }
}

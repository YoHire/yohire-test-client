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
import { CsrfTokenService } from '../services/csrf.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorHandlingService } from '../services/error-handling.service';
import { URL } from '../constants/constants';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private csrfTokenService: CsrfTokenService,
    private _spinner: NgxSpinnerService,
    private _errorHandlerService: ErrorHandlingService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const shouldSkipSpinner = this._shouldSkipSpinner(request.url);

    if (!shouldSkipSpinner) {
      this._spinner.show();
    }

    // Add authorization header with JWT token if available
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
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse && !shouldSkipSpinner) {
          this._spinner.hide();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (!shouldSkipSpinner) {
          this._spinner.hide();
        }
        this._errorHandlerService.handleError(error);
        return throwError(() => error);
      }),
      finalize(() => {
        if (!shouldSkipSpinner) {
          this._spinner.hide();
        }
      })
    );
  }

  private _shouldSkipSpinner(url: string): boolean {
    const urlsToSkip = [`${URL.CATEGORY}`, `${URL.SKILL}`];
    return urlsToSkip.some((skipUrl) => url.includes(skipUrl));
  }
}

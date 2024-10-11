import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorHandlingService } from '../services/error-handling.service';
import { URL } from '../constants/constants';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
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

    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              const newRequest = this._addToken(request);
              return next.handle(newRequest);
            }),
            catchError((refreshError) => {
              this.authService.signout();
              this._errorHandlerService.handleError(refreshError);
              return throwError(() => refreshError);
            })
          );
        } else {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        }
      }),
      finalize(() => {
        if (!shouldSkipSpinner) {
          this._spinner.hide();
        }
      })
    );
  }

  private _addToken(request: HttpRequest<any>): HttpRequest<any> {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return request;
  }

  private _shouldSkipSpinner(url: string): boolean {
    const urlsToSkip = [`${URL.CATEGORY}`, `${URL.SKILL}`];
    return urlsToSkip.some((skipUrl) => url.includes(skipUrl));
  }
}

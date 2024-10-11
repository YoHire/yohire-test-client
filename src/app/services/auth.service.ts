import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { URL } from '../constants/constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtAuthResponse } from '../models/jwtAuthResponse';
import { ApiResponse } from '../models/apiResponse';
import { UserResponse } from '../models/user-response';
import { RoleName } from '../models/roleName';
import { NotificationService } from './notification.service';
import { CsrfTokenService } from './csrf.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    ''
  );
  public currentUser: Observable<any> = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private notificationService: NotificationService,
    private csrfTokenService: CsrfTokenService
  ) {
    try {
      this.currentUserSubject = new BehaviorSubject<any>(
        JSON.parse(localStorage.getItem('currentUser') ?? '')
      );
      this.currentUser = this.currentUserSubject.asObservable();
    } catch (err) {}
  }

  public get currentUserValue(): JwtAuthResponse {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject?.value?.user?.id?.length > 0;
  }

  hasRole(role: any) {
    for (let roles of this.currentUserValue?.user?.authorities) {
      if (roles == role) {
        return true;
      }
    }
    return false;
  }

  getCurrentUserRole(): RoleName | null {
    if (this.hasRole(RoleName.ROLE_SUPER_ADMIN)) {
      return RoleName.ROLE_SUPER_ADMIN;
    } else if (this.hasRole(RoleName.ROLE_ADMIN)) {
      return RoleName.ROLE_ADMIN;
    } else if (this.hasRole(RoleName.ROLE_RECRUITER)) {
      return RoleName.ROLE_RECRUITER;
    }
    return null;
  }

  signin(
    email: string,
    password?: string,
    provider?: string,
    returnUrl?: string
  ) {
    return this.http
      .post<any>(
        URL.SIGNIN,
        { email, password, provider },
        { withCredentials: true }
      )
      .pipe(
        map((result) => {
          if (result && result.accessToken) {
            try {
              if (!result.user.verified) {
                this.notificationService.showError(
                  'Please contact our team.',
                  'User Not Verified'
                );
                return;
              }
              localStorage.setItem('user_id', result.user.id.toString());
              localStorage.setItem('user_name', result.user.name.toString());
              localStorage.setItem(
                'user_role',
                result.user.authorities.toString()
              );
              localStorage.setItem('currentUser', JSON.stringify(result));
              localStorage.setItem('accessToken', result.accessToken);
              localStorage.setItem('refreshToken', result.refreshToken);
              this.currentUserSubject.next(result);
              if (returnUrl === '/circle') {
                this.router.navigate(['/']);
              } else {
                this.router.navigate(['/']);
              }
            } catch (err: any) {}
          } else {
          }
          return result;
        })
      );
  }

  signInWithGoogle(token: string) {
    return this.http.post<any>(`${URL.AUTH}/google`, { token }, httpOptions);
  }

  signout() {
    localStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.signout();
    }
    return this.http.post<any>(URL.REFRESH_TOKEN, { refreshToken }).pipe(
      tap((tokens: { accessToken: string; refreshToken: string }) => {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      })
    );
  }

  recruiter(user: any): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(
      URL.RECRUITER,
      user,
      httpOptions
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${URL.AUTH}/forgot-password?email=${email}`,
      httpOptions
    );
  }

  validateToken(userId: string, token: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${URL.AUTH}/validate-token?userId=${userId}&token=${token}`,
      httpOptions
    );
  }

  resetPassword(reset: any): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${URL.AUTH}/reset-password`,
      reset,
      httpOptions
    );
  }

  verifyPassword(
    userId: string,
    password: string
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${URL.AUTH}/verify-password`,
      { userId, password },
      httpOptions
    );
  }

  raidList(search: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${URL.RECRUITER}/list-raids?search=${search}`,
      httpOptions
    );
  }

  rcList(): Observable<string[]> {
    return this.http.get<string[]>(URL.AUTH + '/datas/rc', httpOptions);
  }
}

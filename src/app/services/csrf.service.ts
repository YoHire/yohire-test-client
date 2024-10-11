import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
};

@Injectable({
  providedIn: 'root',
})
export class CsrfTokenService {
  private token: string | undefined;

  constructor(private http: HttpClient) {}

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | undefined {
    return this.token;
  }

  getCsrfToken(): Observable<any> {
    return this.http.get(
      'http://localhost:3000/api/v1/auth/csrf-token',
      httpOptions
    );
  }
}

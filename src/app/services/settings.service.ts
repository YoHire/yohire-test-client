import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL } from '../constants/constants';
import { ApiResponse } from '../models/apiResponse';
import { Settings } from '../models/settings';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private http: HttpClient) {}

  list(): Observable<Settings[]> {
    return this.http.get<Settings[]>(URL.SETTINGS);
  }

  update(settings: any[]): Observable<ApiResponse<Settings[]>> {
    return this.http.put<ApiResponse<Settings[]>>(
      URL.SETTINGS,
      settings,
      httpOptions
    );
  }
}

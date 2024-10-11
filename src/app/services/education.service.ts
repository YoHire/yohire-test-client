import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL } from '../constants/constants';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class EducationService {
  constructor(private http: HttpClient) {}

  list(
    level: string,
    subCategory?: string,
    course?: string
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${URL.QUALIFICATIONS}?level=${level}&subCategory=${subCategory}&course=${course}`,
      httpOptions
    );
  }
}

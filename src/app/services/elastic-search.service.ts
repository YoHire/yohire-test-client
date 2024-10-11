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
export class ElasticSearchService {
  constructor(private http: HttpClient) {}
  createIndex(index: string): Observable<any> {
    return this.http.post<any>(
      `${URL.ELASTIC_SEARCH}/create-index/${index}`,
      httpOptions
    );
  }
}

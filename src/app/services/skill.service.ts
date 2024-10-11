import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Skill } from '../models/skill';
import { URL } from '../constants/constants';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
@Injectable({
  providedIn: 'root',
})
export class SkillService {
  constructor(private http: HttpClient) {}

  list(): Observable<Skill[]> {
    return this.http.get<Skill[]>(URL.SKILL, httpOptions);
  }
  listSkills(keyword: string): Observable<any> {
    return this.http.get<any>(
      `${URL.SKILL}/search-skills/${keyword}`,
      httpOptions
    );
  }
}

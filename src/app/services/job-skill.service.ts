import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/apiResponse';
import { JobSkill } from '../models/job-skill';
import { URL } from '../constants/constants';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class JobSkillService {
  constructor(private http: HttpClient) {}

  update(jobId: string, selectedSkills: any): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      URL.SKILL,
      { jobId, selectedSkills },
      httpOptions
    );
  }

  list(jobId: number, status: any): Observable<JobSkill[]> {
    return this.http.get<JobSkill[]>(
      `${URL.SKILL}/${jobId}/${status}`,
      httpOptions
    );
  }
}

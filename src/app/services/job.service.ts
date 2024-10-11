import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ApiResponse } from '../models/apiResponse';
import { Countries } from '../models/countries';
import { DashboardResponse } from '../models/dashboard-response';
import { JobDetailedResponse } from '../models/job-detailed-response';
import { JobResponse } from '../models/jobResponse';
import { RecommendedQuestions } from '../models/recommended-questions';
import { URL } from '../constants/constants';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class JobService {
  constructor(private http: HttpClient) {}

  listForAdmin(status: string): Observable<JobResponse[]> {
    return this.http
      .get<JobResponse[]>(`${URL.ADMIN}/list/jobs/${status}`, httpOptions)
      .pipe();
  }
  listBasedOnSearch(keyword: string): Observable<any> {
    return this.http.get<any>(
      `${URL.RECRUITER}/languages/${keyword}`,
      httpOptions
    );
  }

  listForRecruiter(
    status: string,
    page: number,
    size: number
  ): Observable<JobResponse[]> {
    return this.http
      .get<JobResponse[]>(
        `${URL.JOB}/recruiter?status=${status}&page=${page}&size=${size}`,
        httpOptions
      )
      .pipe();
  }

  listForRecruiterExpired(
    categoryId: number,
    status: string
  ): Observable<JobResponse[]> {
    return this.http
      .get<JobResponse[]>(
        URL.JOB +
          '/recruiter/expired?categoryId=' +
          categoryId +
          '&status=' +
          status,
        httpOptions
      )
      .pipe();
  }

  listForAdminExpired(
    recruiterId: number,
    status: string
  ): Observable<JobResponse[]> {
    return this.http
      .get<JobResponse[]>(
        URL.JOB +
          '/admin/expired?recruiterId=' +
          recruiterId +
          '&status=' +
          status,
        httpOptions
      )
      .pipe();
  }

  dashboard(): Observable<DashboardResponse> {
    return this.http
      .get<DashboardResponse>(URL.JOB + '/dashboard', httpOptions)
      .pipe();
  }

  deleteWithMessage(jobId: string): Observable<ApiResponse<JobResponse>> {
    return this.http
      .delete<ApiResponse<JobResponse>>(
        `${URL.ADMIN}/jobs/${jobId}`,
        httpOptions
      )
      .pipe();
  }

  delete(jobId: number): Observable<ApiResponse<JobResponse>> {
    return this.http
      .delete<ApiResponse<JobResponse>>(`${URL.JOB}/${jobId}`, httpOptions)
      .pipe();
  }

  statusUpdate(
    jobId: number,
    status: string
  ): Observable<ApiResponse<JobResponse>> {
    return this.http.patch<ApiResponse<JobResponse>>(
      URL.JOB + '/' + jobId + '/status/' + status,
      httpOptions
    );
  }
  getJob(jobId: any): Observable<ApiResponse<JobDetailedResponse>> {
    return this.http.get<ApiResponse<JobDetailedResponse>>(
      `${URL.JOB}/fetch/${jobId}`
    );
  }
  

  create(job: any, companyData: any): Observable<ApiResponse<JobResponse>> {
    return this.http.post<ApiResponse<JobResponse>>(
      URL.JOB,
      { job, companyData },
      httpOptions
    );
  }

  update(jobId: any, job: any): Observable<ApiResponse<JobResponse>> {
    return this.http.patch<ApiResponse<JobResponse>>(
      URL.JOB,
      { jobId, job },
      httpOptions
    );
  }

  verify(jobId: any): Observable<ApiResponse<JobResponse>> {
    return this.http.patch<ApiResponse<JobResponse>>(
      URL.JOB + '/verify/' + jobId,
      httpOptions
    );
  }
  updateJobImage(jobId: any, image: any): Observable<ApiResponse<JobResponse>> {
    const formData = new FormData();
    formData.append('id', jobId);
    formData.append('image', image);
    return this.http.post<ApiResponse<any>>(URL.UPLOAD, formData);
  }

  payForCandidate(
    jobId: number,
    count: number
  ): Observable<ApiResponse<JobResponse>> {
    return this.http.patch<ApiResponse<JobResponse>>(
      URL.JOB + '/pay/order/' + jobId + '/count/' + count,
      httpOptions
    );
  }

  recommendQuestions(): Observable<RecommendedQuestions[]> {
    return this.http.get<RecommendedQuestions[]>(
      URL.JOB + '/questions/recommended'
    );
  }
  getCountries(): Observable<Countries[]> {
    return this.http.get<Countries[]>('https://restcountries.com/v3.1/all');
  }
}

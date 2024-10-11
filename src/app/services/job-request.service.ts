import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/apiResponse';
import { JobRequestDetailedResponse } from '../models/job-request-detailed-response';
import { JobRequests } from '../models/jobRequests';
import { URL } from '../constants/constants';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class JobRequestService {
  apiUrl = environment.apiUrl as string;

  constructor(private http: HttpClient) {}

  updateStatus(
    jobId: String,
    id: String,
    remark: String,
    status: String
  ): Observable<ApiResponse<JobRequests>> {
    var data = {
      jobRequestId: id,
      status: status,
      remark: remark,
    };
    return this.http.patch<ApiResponse<JobRequests>>(
      URL.JOB + '/' + jobId + '/requests/status',
      data,
      httpOptions
    );
  }

  updateJobRequirement(
    jobId: any,
    requirementCount: number,
    candidateId: any
  ): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${URL.JOB}/update-job-requirement`,
      { jobId, requirementCount, candidateId },
      httpOptions
    );
  }
  list(jobId: number): Observable<JobRequests[]> {
    return this.http.get<JobRequests[]>(
      `${URL.JOB}/${jobId}/requests/`,
      httpOptions
    );
  }

  verify(jobId: number, verifyData: any): Observable<ApiResponse<JobRequests>> {
    return this.http.patch<ApiResponse<JobRequests>>(
      URL.JOB + '/' + jobId + '/requests/verify',
      verifyData,
      httpOptions
    );
  }

  fetch(
    jobId: number,
    jobRequestId: number
  ): Observable<ApiResponse<JobRequestDetailedResponse>> {
    return this.http.get<ApiResponse<JobRequestDetailedResponse>>(
      `${URL.JOB}/${jobId}/requests/fetch/${jobRequestId}`,
      httpOptions
    );
  }

  downloadPDF(dataObj: any) {
    let requestOptions = {
      headers: httpOptions,
      responseType: 'blob' as 'blob',
    };
    // post or get depending on your requirement
    this.http
      .post(this.apiUrl, dataObj, httpOptions)
      .pipe(
        map((data: any) => {
          let blob = new Blob([data], {
            type: 'application/pdf', // must match the Accept type
            // type: 'application/octet-stream' // for excel
          });
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'samplePDFFile.pdf';
          link.click();
          window.URL.revokeObjectURL(link.href);
        })
      )
      .subscribe((result: any) => {});
  }
}

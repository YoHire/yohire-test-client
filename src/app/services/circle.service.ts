import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL } from '../constants/constants';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class CircleService {
  constructor(private http: HttpClient) {}
  searchResumes(keyword: string): Observable<any> {
    return this.http.get<any>(`${URL.CIRCLE}/list/${keyword}`, httpOptions);
  }
  listCountries(): Observable<any> {
    return this.http.get<any>(`${URL.CIRCLE}/countries`, httpOptions);
  }
  searchedProfiles(
    keyword: string,
    page: number,
    itemsPerPage: number,
    filterForm?: any
  ): Observable<any> {
    const requestBody = {
      keyword,
      page,
      itemsPerPage,
      filterForm,
    };
    return this.http.post<any>(`${URL.CIRCLE}/search`, requestBody);
  }
  filterQualifications(level: string, subCategory?: string): Observable<any> {
    return this.http.get<any>(
      `${URL.CIRCLE}/qualifications?level=${level}&subCategory=${subCategory}`,
      httpOptions
    );
  }
  listProfileFilters(profileIds: string[]): Observable<any> {
    return this.http.post<any>(
      `${URL.CIRCLE}/search/filters`,
      { profileIds },
      httpOptions
    );
  }
  listJobs(): Observable<any> {
    return this.http.get<any>(`${URL.CIRCLE}/jobs`, httpOptions);
  }
  listSkills(keyword: string): Observable<any> {
    return this.http.get<any>(
      `${URL.SKILL}/search-skills/${keyword}`,
      httpOptions
    );
  }
  listBasedOnSearch(keyword: string): Observable<any> {
    return this.http.get<any>(
      `${URL.RECRUITER}/languages/${keyword}`,
      httpOptions
    );
  }
  listInvitedQueues(
    id: string,
    page: number,
    itemsPerPage: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());
    return this.http.get<any>(`${URL.CIRCLE}/invited-job/${id}`, {
      params,
      ...httpOptions,
    });
  }
  userQueueDetails(userIds: any): Observable<any> {
    return this.http.get<any>(
      `${URL.CIRCLE}/queue-profiles/${userIds}`,
      httpOptions
    );
  }
  listInvitedJobs(page: number, itemsPerPage: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());
    return this.http.get<any>(`${URL.CIRCLE}/invited-jobs`, {
      params,
      ...httpOptions,
    });
  }
  updateQueueDownload(
    queueIds: string[],
    jobData: { jobTitle: string; jobDescription: string }
  ): Observable<any> {
    return this.http.patch<any>(
      `${URL.CIRCLE}/download-profiles`,
      {
        queueIds,
        jobData,
      },
      httpOptions
    );
  }
  queueProfileClicked(id: string): Observable<any> {
    return this.http.patch<any>(`${URL.CIRCLE}/queue/${id}/click`, httpOptions);
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/apiResponse';
import { UserResponse } from '../models/user-response';
import { URL } from '../constants/constants';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  createAdmin(user: any): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(
      `${URL.ADMIN}/new-admin`,
      user,
      httpOptions
    );
  }
  dashboard(): Observable<any> {
    return this.http.get<any>(`${URL.ADMIN}/dashboard/list`, httpOptions);
  }

  updateKycVerification(kycId: string): Observable<ApiResponse<UserResponse>> {
    return this.http.patch<ApiResponse<UserResponse>>(
      `${URL.ADMIN}/verification-update/${kycId}`,
      httpOptions
    );
  }

  deleteImage(id: string): Observable<ApiResponse<UserResponse>> {
    return this.http.patch<ApiResponse<UserResponse>>(
      `${URL.RECRUITER}/delete-image/${id}`,
      httpOptions
    );
  }
  getUserCoinBalance(): Observable<any> {
    return this.http.get<any>(`${URL.RECRUITER}/coin-balance`, httpOptions);
  }

  updateFreeCoinBalance(
    jobId: any,
    coinAmount: number,
    candidateId: any
  ): Observable<any> {
    return this.http.patch<any>(
      `${URL.RECRUITER}/free-coinBalance`,
      { jobId, coinAmount, candidateId },
      httpOptions
    );
  }

  updateAdmin(userId: any, user: any): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(
      URL.ADMIN + '/admin/' + userId,
      user,
      httpOptions
    );
  }

  list(role: string, status: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(
      `${URL.ADMIN}/${role}?status=${status}`,
      httpOptions
    );
  }

  listTransactions(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(
      `${URL.ADMIN}/transactions/list`,
      httpOptions
    );
  }

  delete(recruiterId: string): Observable<ApiResponse<UserResponse>> {
    return this.http.delete<ApiResponse<UserResponse>>(
      `${URL.ADMIN}/recruiters/${recruiterId}`,
      httpOptions
    );
  }

  statusUpdate(
    userId: string,
    status: string
  ): Observable<ApiResponse<UserResponse>> {
    return this.http.patch<ApiResponse<UserResponse>>(
      `${URL.ADMIN}/status`,
      { userId, status },
      httpOptions
    );
  }
  recruiterStatusUpdate(
    recruiterId: string,
    status: string
  ): Observable<ApiResponse<UserResponse>> {
    return this.http.patch<ApiResponse<UserResponse>>(
      `${URL.ADMIN}/recruiters/${recruiterId}/${status}`,
      httpOptions
    );
  }

  getUser(id: number): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(
      URL.RECRUITER + '/fetch/' + id
    );
  }

  verificationUser(userId: number): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(
      URL.ADMIN + '/verification/' + userId,
      httpOptions
    );
  }

  listUsers(): Observable<any> {
    return this.http.get<any>(`${URL.ADMIN}/list/users`, httpOptions);
  }

  listRecruiters(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(
      URL.ADMIN + '/recruiters/list',
      httpOptions
    );
  }

  updateRecruiter(userId: any, user: any): Observable<any> {
    return this.http.put<any>(
      `${URL.RECRUITER}/${userId}`,
      { user: user },
      httpOptions
    );
  }
  updateRecruiterKyc(kycDetails: any): Observable<any> {
    return this.http.patch<any>(
      `${URL.RECRUITER}/update-kyc`,
      { kycDetails },
      httpOptions
    );
  }

  uploadImage(image: any): Observable<ApiResponse<UserResponse>> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<ApiResponse<UserResponse>>(
      `${URL.UPLOAD}?type=profile`,
      formData
    );
  }
  getUserDetails(userId: any): Observable<any> {
    return this.http.get<any>(`${URL.USER}/user/${userId}`, httpOptions);
  }
}

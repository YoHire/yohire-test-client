import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL } from '../constants/constants';
import { Message } from '../models/message';
import { ApiResponse } from '../models/apiResponse';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private http: HttpClient) {}

  save(
    user: String,
    isRead: boolean,
    title: String,
    message: String,
    status: String,
    recepientType: String,
    recepients: String[]
  ): Observable<ApiResponse<Message>> {
    var data = {
      userId: user,
      isRead: isRead.toString(),
      message: message,
      title: title,
      status: status,
      recepientType: recepientType,
      recepients: recepients,
    };
    return this.http.post<ApiResponse<Message>>(URL.MESSAGE, data, httpOptions);
  }

  update(
    id: number,
    user: String,
    isRead: boolean,
    title: String,
    message: String,
    status: String
  ): Observable<ApiResponse<Message>> {
    var data = {
      userId: user,
      isRead: isRead.toString(),
      message: message,
      title: title,
      status: status,
    };
    return this.http.patch<ApiResponse<Message>>(
      URL.MESSAGE + '/' + id,
      data,
      httpOptions
    );
  }

  listSend(): Observable<Message[]> {
    return this.http.get<Message[]>(URL.MESSAGE + '/sent');
  }

  listRecevied(): Observable<Message[]> {
    return this.http.get<Message[]>(URL.MESSAGE + '/recevied');
  }

  fetch(id: number): Observable<ApiResponse<Message>> {
    return this.http.get<ApiResponse<Message>>(URL.MESSAGE + '/' + id);
  }

  remove(id: number): Observable<ApiResponse<Message>> {
    return this.http.delete<ApiResponse<Message>>(
      URL.MESSAGE + '/' + id,
      httpOptions
    );
  }
}

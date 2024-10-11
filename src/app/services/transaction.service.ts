import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL } from '../constants/constants';
import { Transactions } from '../models/transactions';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private http: HttpClient) {}

  init(
    id: String = '0',
    number: String = '',
    referenceNumber: String = '',
    amount: number = 0.0,
    user: String = '',
    value: String = '',
    status: String = ''
  ): Observable<Transactions> {
    var data = {
      id: id,
      number: number,
      referenceNo: referenceNumber,
      amount: amount,
      user: user,
      value: value,
      status: status,
    };
    return this.http.post<Transactions>(
      URL.TRANSACTION + '/init',
      data,
      httpOptions
    );
  }

  list(): Observable<Transactions[]> {
    return this.http.get<Transactions[]>(URL.TRANSACTION);
  }

  listByUserId(): Observable<Transactions[]> {
    return this.http.get<Transactions[]>(`${URL.TRANSACTION}`);
  }

  listMontlyTranasactions(): Observable<Transactions[]> {
    return this.http.get<Transactions[]>(
      `${URL.TRANSACTION}/monthly-transactions`
    );
  }
}

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
export class PaymentsService {
  constructor(private http: HttpClient) {}

  createOrder(orderData: any): Observable<any> {
    return this.http.post<any[]>(
      `${URL.PAYMENTS}/create-order`,
      orderData,
      httpOptions
    );
  }
  verifyPayment(verificationData: any) {
    return this.http.post<any[]>(
      `${URL.PAYMENTS}/verify-payment`,
      verificationData,
      httpOptions
    );
  }
}

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
export class PaytmService {
  isStaging: boolean = true;
  mid: String = 'JhxWwv91643084415733';
  mkey: String = 'x4F51O&m3Wj9IC3X';
  callbackUrl: String =
    'https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=';

  // isStaging: boolean = false;
  // mid: String = "HlWIPX88493149786979";
  // mkey: String = "l0lfhyBGn@L5C_fP";
  // callbackUrl: String =
  //   "https://securegw.paytm.in/theia/paytmCallback?ORDER_ID=";

  constructor(private http: HttpClient) {}

  initiateTransaction(
    orderId: String = '',
    value: String = '',
    currency: String = '',
    custId: String = '',
    websiteName: String = '',
    callbackUrl: String = ''
  ): Observable<any> {
    var data = {
      mid: this.mid,
      mkey: this.mkey,
      orderId: orderId,
      value: value,
      currency: currency,
      custId: custId,
      websiteName: websiteName,
      callbackUrl: callbackUrl,
      testing: this.isStaging,
    };
    return this.http.post<any>(URL.PAYTM, data, httpOptions);
  }
}

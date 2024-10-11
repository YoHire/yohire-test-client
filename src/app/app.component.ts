import { Component, OnInit } from '@angular/core';
import { CsrfTokenService } from './services/csrf.service';
// import KTComponents from '../metronic/core/index';
// import KTLayout from '../metronic/app/layouts/demo1';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'yoHire';

  constructor(private readonly _csrfTokenService: CsrfTokenService) {}

  ngOnInit(): void {
 
    // this._initializeCsrfToken();
    
  }
  ngAfterViewInit():void{
    // KTComponents.init();
    // KTLayout.init();
  }

  private _initializeCsrfToken(): void {
    this._csrfTokenService.getCsrfToken().subscribe({
      next: (response: any) => {
        const csrfToken = response.csrfToken;
        this._csrfTokenService.setToken(csrfToken);
      },
    });
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  loadingVisible: boolean = false;
  loadingPercent: number = 0;

  constructor() {}

  startLoading() {
    this.loadingVisible = true;
    this.loadingPercent = 10;
    setTimeout(() => {
      if (this.loadingVisible && this.loadingPercent < 20) {
        this.loadingPercent = 20;
        setTimeout(() => {
          if (this.loadingVisible && this.loadingPercent < 40) {
            this.loadingPercent = 40;
          }
        }, 400);
      }
    }, 400);
  }

  loading(percent: number) {
    if (this.loadingVisible && this.loadingPercent < percent) {
      this.loadingPercent = percent;
    }
  }

  loaded() {
    this.loadingPercent = 100;
    setTimeout(() => {
      this.loadingVisible = false;
      this.loadingPercent = 0;
    }, 500);
  }
}

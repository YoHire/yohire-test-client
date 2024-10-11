import { Component, OnInit } from '@angular/core';
import { TransactionService } from 'src/app/services/transaction.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-screen-time',
  templateUrl: './screen-time.component.html',
})
export class ScreenTimeComponent implements OnInit {
  trackByItemId = trackByItemId;
  logs: any[] = [];

  constructor() {}

  ngOnInit(): void {}

  minutesToHours(value: number): string {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    var time = '';
    if (hours > 0) {
      time = hours + ' hr ';
    }
    if (minutes > 0) {
      time = time + minutes + ' min';
    }
    return time;
  }
}

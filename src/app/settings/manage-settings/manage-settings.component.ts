import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiResponse } from 'src/app/models/apiResponse';
import { Settings } from 'src/app/models/settings';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SettingsService } from 'src/app/services/settings.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-manage-settings',
  templateUrl: './manage-settings.component.html',
})
export class ManageSettingsComponent implements OnInit {
  constructor(
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    private _location: Location
  ) {}

  settings: Settings[] = [];

  ngOnInit(): void {
    this.list();
  }
  trackByItemId = trackByItemId;

  list() {
    this.generalService.startLoading();
    this.settingsService.list().subscribe({
      next: (items: Settings[]) => {
        this.settings = this.typeChanges(items);
        // this.generalService.settings(this.settings);
        this.generalService.loaded();
      },
      error: (error: string) => {
        this.notificationService.showError('Failed', error);
        this.generalService.loaded();
      },
    });
  }

  typeChanges(items: Settings[]) {
    for (let each of items) {
      if (each.valueType == 'BOOLEAN') {
        each.value = each.value == 'true' ? true : false;
      } else if (each.valueType == 'NUMBER') {
        each.value = each.value as number;
      }
    }
    return items;
  }

  back() {
    this._location.back();
  }

  save() {
    this.generalService.startLoading();
    this.settingsService.update(this.settings).subscribe({
      next: (response: ApiResponse<Settings[]>) => {
        this.settings = this.typeChanges(response.data);
        this.notificationService.showSuccess('Success', response.message);
        this.generalService.loaded();
      },
      error: (error: string) => {
        this.notificationService.showError('Failed', error);
        this.generalService.loaded();
      },
    });
  }
}

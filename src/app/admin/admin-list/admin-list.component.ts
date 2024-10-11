import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleName } from 'src/app/models/roleName';
import { UserResponse } from 'src/app/models/user-response';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
})
export class AdminListComponent implements OnInit {
  constructor(
    public router: Router,
    public userService: UserService,
    private authService: AuthService,
    public generalService: GeneralService,
    public notificationService: NotificationService,
    public pageLocation: Location
  ) {}

  items: UserResponse[] = [];
  itemsFiltered: UserResponse[] = [];

  pageCount: number = 0;
  page: number = 0;
  size: number = 10;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  sortedColumn = 'name';
  sortedDirection = 'asc';

  deleteId: string = '0';
  // status: any = 2;

  status: string = 'ACTIVE';
  loginUser: string = '';
  trackByItemId = trackByItemId;

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.list();
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.items.filter(function (d: UserResponse) {
      let filter1 = d.name.toLowerCase().indexOf(val) !== -1;
      let filter2 = d.username.toLowerCase().indexOf(val) !== -1;
      let filter3 = d.mobile.toLowerCase().indexOf(val) !== -1;
      let filter4 = d.email.toLowerCase().indexOf(val) !== -1;
      return filter1 || filter2 || filter3 || filter4 || !val;
    });

    this.itemsFiltered = temp;
    this.paginateItems();
  }

  paginateItems() {
    if (this.size > 0 && this.itemsFiltered.length > this.size) {
      this.pageCount = Math.ceil(this.itemsFiltered.length / this.size);
      if (this.pageCount <= this.page) {
        this.page = 0;
      }
      this.pageStartIndex = this.page * this.size;
      this.pageEndIndex = this.pageStartIndex + Number(this.size);
    } else {
      this.pageCount = 0;
      this.pageStartIndex = 0;
      this.pageEndIndex = this.itemsFiltered.length;
    }
  }

  sortByField(field: string) {
    if (this.sortedColumn == field) {
      this.sortedDirection = this.sortedDirection == 'desc' ? 'asc' : 'desc';
    } else {
      this.sortedColumn = field;
    }
  }

  list() {
    this.generalService.startLoading();
    this.userService.list('ADMIN', this.status).subscribe((items: any) => {
      this.generalService.loading(70);
      this.items = items.data;
      this.itemsFiltered = [...this.items];
      this.paginateItems();
      this.generalService.loaded();
    });
  }

  statusUpdate(item: any, status: string) {
    this.generalService.startLoading();
    this.userService.statusUpdate(item.id, status).subscribe({
      next: (data) => {
        this.list();
        this.generalService.loaded();
        this.notificationService.showSuccess(data.message, 'Success');
      },
    });
  }

  delete() {
    this.generalService.startLoading();
    this.userService.delete(this.deleteId).subscribe({
      next: (data) => {
        this.list();
        this.generalService.loaded();
        this.notificationService.showSuccess(data.message, 'Success');
      },
    });
  }
}

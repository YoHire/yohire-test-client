import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
})
export class DetailsComponent implements OnInit {
  constructor(
    public router: Router,
    public userService: UserService,
    private authService: AuthService,
    public generalService: GeneralService,
    public notificationService: NotificationService
  ) {}
  loginUser = '';
  items: any;
  itemsFiltered: any;
  pageCount: number = 0;
  page: number = 0;
  size: number = 20;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;
  sortedColumn = 'name';
  sortedDirection = 'asc';
  trackByItemId = trackByItemId;
  sortByField(field: string) {
    if (this.sortedColumn == field) {
      this.sortedDirection = this.sortedDirection == 'desc' ? 'asc' : 'desc';
    } else {
      this.sortedColumn = field;
    }
  }

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.list();
  }
  list() {
    this.generalService.startLoading();
    this.userService.listTransactions().subscribe({
      next: (items: any) => {
        this.generalService.loading(70);
        this.items = items.data;
        this.itemsFiltered = [...this.items];
        this.paginateItems();
        this.generalService.loaded();
      },
      error: () => {
        this.generalService.loaded();
      },
    });
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
}

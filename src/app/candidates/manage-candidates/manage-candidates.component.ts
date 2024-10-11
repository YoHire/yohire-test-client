import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CategoryResponse } from 'src/app/models/categoryResponse';
import { RoleName } from 'src/app/models/roleName';
import { UserResponse } from 'src/app/models/user-response';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-manage-candidates',
  templateUrl: './manage-candidates.component.html',
})
export class ManageCandidatesComponent implements OnInit {
  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    private authService: AuthService,
    public pageLocation: Location
  ) {}

  items: UserResponse[] = [];
  itemsFiltered: UserResponse[] = [];

  catItems: CategoryResponse[] = [];

  pageCount: number = 0;
  page: number = 0;
  size: number = 20;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  catId: number = 0;
  status: any = 2;

  sortedColumn = 'name';
  sortedDirection = 'asc';
  apiUrl = environment.apiUrl;
  loginUser: string = '';
  trackByItemId = trackByItemId;

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.list();
    // this.listCat();
  }

  listCat() {
    this.generalService.startLoading();
    this.categoryService.list('Active').subscribe({
      next: (items: CategoryResponse[]) => {
        this.catItems = items;
        this.generalService.loaded();
      },
      error: (error: string) => {
        this.notificationService.showError(error, 'Failed');
        this.generalService.loaded();
      },
    });
  }

  list() {
    this.generalService.startLoading();
    this.userService.listUsers().subscribe({
      next: (items: any) => {
        this.items = items.data
        this.itemsFiltered = [...this.items];
        this.paginateItems();
        this.generalService.loaded();
      },
      error: (error: string) => {
        this.notificationService.showError(error, 'Failed');
        this.generalService.loaded();
      },
    });
  }

  customFilter(event: any) {
    const val = event.target.value.toLowerCase();

    const temp = this.items.filter(function (d: any) {
      let filter1 = d.name.toLowerCase().indexOf(val) !== -1;
      let filter2 = d.email.toLowerCase().indexOf(val) !== -1;
      let filter3 = d.mobile.toLowerCase().indexOf(val) !== -1;
      let filter4 = d.uniqueId
        ? d.uniqueId.toLowerCase().indexOf(val) !== -1
        : '';
      let filter5 = d.pin ? d.pin.toLowerCase().indexOf(val) !== -1 : '';
      let filter6 = d.category
        ? d.category.name.toLowerCase().indexOf(val) !== -1
        : '';
      // let filter7 = d.subCategory? d.subCategory.name.toLowerCase().indexOf(val) !== -1 : '';

      return (
        filter1 || filter2 || filter3 || filter4 || filter5 || filter6 || !val
      );
    });

    // update the rows
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

  delete(id: any) {
    this.generalService.startLoading();
    this.userService.delete(id).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.list();
        this.generalService.loaded();
      },
      error: (error) => {
        this.notificationService.showError(error.message, 'Failed');
        this.generalService.loaded();
      },
    });
  }

  verify(id: any) {
    this.generalService.startLoading();
    this.userService.verificationUser(id).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.list();
        this.generalService.loaded();
      },
      error: (error) => {
        this.notificationService.showError(error.message, 'Failed');
        this.generalService.loaded();
      },
    });
  }

  statusUpdate(id: any, status: any) {
    this.generalService.startLoading();
    this.userService.statusUpdate(id, status).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.list();
        this.generalService.loaded();
      },
      error: (error) => {
        this.notificationService.showError(error.message, 'Failed');
        this.generalService.loaded();
      },
    });
  }
}

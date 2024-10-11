import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CategoryResponse } from 'src/app/models/categoryResponse';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-manage-categories',
  templateUrl: './manage-categories.component.html',
})
export class ManageCategoriesComponent implements OnInit {
  constructor(
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    private authService: AuthService,
    public pageLocation: Location
  ) {}

  items: CategoryResponse[] = [];
  itemsFiltered: CategoryResponse[] = [];

  pageCount: number = 0;
  page: number = 0;
  size: number = 20;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  sortedColumn = 'name';
  sortedDirection = 'asc';

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

  list() {
    this.generalService.startLoading();
    this.categoryService.list(this.status).subscribe({
      next: (items: any) => {
        this.items = items.categories;
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

      return filter1 || !val;
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

  showPaginationNumber(currentPage: number, index: number) {
    if (this.pageCount <= 15) {
      return true;
    } else {
      let minNo = currentPage - 7;
      let maxNo = currentPage + 7;
      if (index < minNo) {
        return false;
      } else if (index > maxNo) {
        return false;
      } else {
        return true;
      }
    }
  }

  sortByField(field: string) {
    if (this.sortedColumn == field) {
      this.sortedDirection = this.sortedDirection == 'desc' ? 'asc' : 'desc';
    } else {
      this.sortedColumn = field;
    }
  }

  delete(id: string) {
    this.generalService.startLoading();
    this.categoryService.delete(id).subscribe({
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

  statusUpdate(id: string, status: string) {
    this.generalService.startLoading();
    this.categoryService.statusUpdate(id, status).subscribe({
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

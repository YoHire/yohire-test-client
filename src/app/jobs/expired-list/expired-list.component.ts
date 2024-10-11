import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CategoryResponse } from 'src/app/models/categoryResponse';
import { JobResponse } from 'src/app/models/jobResponse';
import { RoleName } from 'src/app/models/roleName';
import { SubCategoryResponse } from 'src/app/models/subCategoryResponse';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { URL } from 'src/app/constants/constants';
import { GeneralService } from 'src/app/services/general.service';
import { JobService } from 'src/app/services/job.service';
import { NotificationService } from 'src/app/services/notification.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-expired-list',
  templateUrl: './expired-list.component.html',
})
export class ExpiredListComponent implements OnInit {
  constructor(
    private jobService: JobService,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    private authService: AuthService,
    public pageLocation: Location,
  ) {}

  imageUrl = URL.IMAGE;
  jobId: number = 0;
  job: JobResponse | any;
  // data: UserFetchResponse | null = null;
  // role: RoleName | null = null;
  items: JobResponse[] = [];
  itemsFiltered: JobResponse[] = [];

  categories: CategoryResponse[] = [];
  subCategories: SubCategoryResponse[] = [];

  pageCount: number = 0;
  page: number = 0;
  size: number = 10;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  sortedColumn = 'name';
  sortedDirection = 'asc';

  status: string = 'Active';
  categoryId: number = 0;
  loginUser: string = '';
  trackByItemId = trackByItemId;

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.list();
    this.categoryList();
  }

  list() {
    this.generalService.startLoading();
    this.jobService
      .listForRecruiterExpired(this.categoryId, this.status)
      .subscribe({
        next: (items: any) => {
          this.items = items;
          this.itemsFiltered = [...this.items];
          this.paginateItems();
          this.generalService.loaded();
        },
      });
  }
  customFilter(event: any) {
    const val = event.target.value.toLowerCase();

    const temp = this.items.filter(function (d: JobResponse) {
      let filter1 = d.id.toString().indexOf(val) !== -1;
      let filter2 = d.title.toLowerCase().indexOf(val) !== -1;
      let filter3 = d.category.name.toLowerCase().indexOf(val) !== -1;
      let filter4 =
        d.subCategory && d.subCategory.name.toLowerCase().indexOf(val) !== -1;
      let filter5 =
        d.expiryDate && d.expiryDate.toLowerCase().indexOf(val) !== -1;
      let filter6 =
        d.candidateCount && d.candidateCount.toString().indexOf(val) !== -1;

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
  statusUpdate(id: any, status: any) {
    this.generalService.startLoading();
    this.jobService.statusUpdate(id, status).subscribe({
      next: (data) => {
        this.notificationService.showSuccess('Success', data.message);
        this.list();
        this.generalService.loaded();
      },
    });
  }
  delete(id: any) {
    this.generalService.startLoading();
    this.jobService.delete(id).subscribe({
      next: (data) => {
        this.notificationService.showSuccess('Success', data.message);
        this.list();
        this.generalService.loaded();
      },
    });
  }
  categoryList() {
    this.categoryService.list(this.status).subscribe({
      next: (item: CategoryResponse[]) => {
        this.categories = item;
      },
    });
  }
}

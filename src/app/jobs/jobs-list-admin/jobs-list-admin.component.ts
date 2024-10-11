import { Location } from '@angular/common';
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryResponse } from 'src/app/models/categoryResponse';
import { JobResponse } from 'src/app/models/jobResponse';
import { RoleName } from 'src/app/models/roleName';
import { SubCategoryResponse } from 'src/app/models/subCategoryResponse';
import { UserResponse } from 'src/app/models/user-response';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { URL } from 'src/app/constants/constants';
import { GeneralService } from 'src/app/services/general.service';
import { JobService } from 'src/app/services/job.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { JobsTabListAdminComponent } from '../jobs-tab-list-admin/jobs-tab-list-admin.component';

@Component({
  selector: 'app-jobs-list-admin',
  templateUrl: './jobs-list-admin.component.html',
})
export class JobsListAdminComponent implements OnInit {
  constructor(
    private jobService: JobService,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    public pageLocation: Location,
  ) {}
  imageUrl = URL.IMAGE;
  items: JobResponse[] = [];
  itemsFiltered: JobResponse[] = [];

  recruiters: UserResponse[] = [];

  pageCount: number = 0;
  page: number = 0;
  size: number = 20;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  sortedColumn = 'name';
  sortedDirection = 'asc';
  verified: string = 'pending';
  loginUser: string = '';
  // status: any = 2;

  // verified: string = "all";
  recruiterId: number = 0;
  reason: string | any;
  selectedJobId: number = 0;

  selectedTab: string = 'running';
  categories: CategoryResponse[] = [];
  subCategories: SubCategoryResponse[] = [];

  @ViewChild(JobsTabListAdminComponent) child: JobsTabListAdminComponent | any;
  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';
    this.activatedRoute.params.subscribe((params) => {
      this.selectedTab = params['tab'] ?? 'running';
    });
    this.list();
  }

  list() {
    this.generalService.startLoading();
    this.jobService.listForAdmin('ACTIVE').subscribe({
      next: (items: any) => {
        this.items = items.data;
        this.itemsFiltered = [...this.items];
        this.paginateItems();
        this.generalService.loaded();
      },
    });
  }

  customFilter(event: any) {
    const val = event.target.value.toLowerCase();

    const temp = this.items.filter(function (d: JobResponse) {
      // let filter1 = d.name.toLowerCase().indexOf(val) !== -1;
      let filter1 = d.recruiter.name.toLowerCase().indexOf(val) !== -1;
      let filter2 = d.title.toLowerCase().indexOf(val) !== -1;
      let filter3 = d.category.name.toLowerCase().indexOf(val) !== -1;

      return filter1 || filter2 || filter3 || !val;
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

  getSelectedJobId(id: any) {
    this.selectedJobId = id;
  }

  statusUpdate(id: number, status: any) {
    this.generalService.startLoading();
    this.jobService.statusUpdate(id, status).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.list();
        this.generalService.loaded();
      },
    });
  }


  categoryList() {
    this.categoryService.list('Active').subscribe({
      next: (item: CategoryResponse[]) => {
        this.categories = item;
      },
    });
  }
}

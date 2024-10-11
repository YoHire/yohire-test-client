import { Location } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CategoryResponse } from 'src/app/models/categoryResponse';
import { JobResponse } from 'src/app/models/jobResponse';
import { URL } from 'src/app/constants/constants';
import { GeneralService } from 'src/app/services/general.service';
import { JobRequestService } from 'src/app/services/job-request.service';
import { JobService } from 'src/app/services/job.service';
import { NotificationService } from 'src/app/services/notification.service';
import { map, switchMap, forkJoin, finalize, mergeMap } from 'rxjs';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-jobs-tab-list',
  templateUrl: './jobs-tab-list.component.html',
})
export class JobsTabListComponent implements OnInit {
  @Input() tab: string = 'running';
  @Input() categories: CategoryResponse[] = [];

  constructor(
    private jobService: JobService,
    private jobRequestService: JobRequestService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    public pageLocation: Location,
    private authService: AuthService
  ) {}
  trackByItemId = trackByItemId;

  imageUrl = URL.IMAGE;
  jobId: number = 0;
  job: JobResponse | any;
  // data: UserFetchResponse | null = null;
  // role: RoleName | null = null;
  items: JobResponse[] = [];
  itemsFiltered: any;

  pageCount: number = 0;
  page: number = 0;
  size: number = 10;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;
  sortedColumn = 'name';
  sortedDirection = 'asc';

  status: string = 'ACTIVE';
  loginUser: string = '';

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.list();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab && !changes.tab.firstChange) {
      this.page = 0
      this.size = 10
      this.pageCount= 0
      this.list();
    }
  }

  list() {
    this.items = [];
    this.itemsFiltered = [];
    if (this.tab === 'running') {
      this.status = 'ACTIVE';
      this.nonExpiredList();
    } else {
      this.status = 'INACTIVE';
      this.expiredList();
    }
  }

  private fetchJobApplications(jobs: any[]) {
    const jobRequests$ = jobs.map((job: any) =>
      this.listJobRequests(job).pipe(
        map((applicationsCount) => ({ job, applicationsCount }))
      )
    );
    return forkJoin(jobRequests$);
  }

  private handleJobApplications(response: any) {
    this.items = response.data;
    const totalCount = response.totalCount;
    return this.fetchJobApplications(this.items).pipe(
      map((jobApplications) => {
        jobApplications.forEach(({ job, applicationsCount }) => {
          job.applicationsCount = applicationsCount;
        });
        this.itemsFiltered = [...this.items];
        this.pageCount = Math.ceil(totalCount / this.size);
        this.paginateItems();
      })
    );
  }

  nonExpiredList() {
    this.generalService.startLoading();
    this.jobService
      .listForRecruiter(this.status, this.page, this.size)
      .pipe(
        mergeMap((response) => this.handleJobApplications(response)),
        finalize(() => this.generalService.loaded())
      )
      .subscribe();
  }

  expiredList() {
    this.generalService.startLoading();
    this.jobService
      .listForRecruiter(this.status, this.page, this.size)
      .pipe(
        mergeMap((response) => this.handleJobApplications(response)),
        finalize(() => this.generalService.loaded())
      )
      .subscribe();
  }

  listJobRequests(job: any) {
    return this.jobRequestService
      .list(job.id)
      .pipe(map((items: any) => items.data.length));
  }

  customFilter(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.items.filter(function (d: any) {
      let filter1 = d.id.toString().indexOf(val) !== -1;
      let filter2 = d.title && d.title.toLowerCase().indexOf(val) !== -1;
      let filter3 = d.category.name.toLowerCase().indexOf(val) !== -1;
      // let filter4 =
      //   d.subCategory && d.subCategory.name.toLowerCase().indexOf(val) !== -1;
      let filter5 =
        d.expiryDate && d.expiryDate.toLowerCase().indexOf(val) !== -1;
      let filter6 =
        d.candidateCount && d.candidateCount.toString().indexOf(val) !== -1;

      return filter1 || filter2 || filter3 || filter5 || filter6 || !val;
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
      // this.pageCount = Math.ceil(this.itemsFiltered.length / this.size);
      this.pageStartIndex = 0;
      this.pageEndIndex = this.itemsFiltered.length;
    }
  }
  onPageChange(newPage: number) {
    if (newPage >= 0 && newPage < this.pageCount) {
      this.page = newPage;
      this.list();
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
        this.notificationService.showSuccess(data.message, 'Success');
        this.list();
        this.generalService.loaded();
      },
    });
  }
  delete(id: any) {
    this.generalService.startLoading();
    this.jobService.delete(id).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.list();
        this.generalService.loaded();
      },
    });
  }
}

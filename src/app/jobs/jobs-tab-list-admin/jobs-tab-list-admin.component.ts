import { Location } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { JobRequests } from 'src/app/models/jobRequests';
import { JobResponse } from 'src/app/models/jobResponse';
import { UserResponse } from 'src/app/models/user-response';
import { URL } from 'src/app/constants/constants';
import { GeneralService } from 'src/app/services/general.service';
import { JobRequestService } from 'src/app/services/job-request.service';
import { JobService } from 'src/app/services/job.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Router } from '@angular/router';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-jobs-tab-list-admin',
  templateUrl: './jobs-tab-list-admin.component.html',
})
export class JobsTabListAdminComponent implements OnInit {
  @Input() tab: string = 'running';
  @Input() recruiters: UserResponse[] = [];

  constructor(
    private jobService: JobService,
    private jobRequestService: JobRequestService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    public pageLocation: Location,
    private router: Router
  ) {}
  imageUrl = URL.IMAGE;
  items: JobResponse[] = [];
  itemsFiltered: JobResponse[] = [];
  slNo: number = 0;
  pageCount: number = 0;
  page: number = 0;
  size: number = 20;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  sortedColumn = 'name';
  sortedDirection = 'asc';
  verified: string = 'pending';
  recruiterId: number = 0;
  reason: string | any;
  selectedJobId: any;
  data!: any;
  trackByItemId = trackByItemId;

  ngOnInit(): void {
    this.data = [
      {
        label: 'View',
        command: () => {
          this.router.navigate([`/jobs/view/${this.selectedJobId}`]);
        },
      },
      {
        label: 'Delete',
        command: () => {
          this.delete(this.selectedJobId);
        },
      },
    ];
    this.list();
  }

  list() {
    if (this.tab == 'running') {
      this.nonExpiredList();
    } else if (this.tab == 'expired') {
      this.expiredList();
    }
  }

  nonExpiredList() {
    this.generalService.startLoading();
    this.jobService.listForAdmin('ACTIVE').subscribe({
      next: (items: any) => {
        this.items = items.data;
        for (let x of this.items) {
          this.listJobRequests(x);
        }
        this.itemsFiltered = [...this.items];
        this.paginateItems();
        this.generalService.loaded();
      },
    });
  }

  listJobRequests(job: JobResponse) {
    let applicationsCount = 0;
    this.generalService.startLoading();
    this.jobRequestService.list(job.id).subscribe({
      next: (items: any) => {
        job.applicationsCount = items.data.length;
        job.resumeDownloaded = items.data.reduce((count: number, item: any) => {
          return count + (item.resumeDownloaded ? 1 : 0);
        }, 0);
      },
      error: (error: string) => {
        this.generalService.loaded();
        return applicationsCount;
      },
    });
    return applicationsCount;
  }

  expiredList() {
    this.generalService.startLoading();
    this.jobService.listForAdmin('INACTIVE').subscribe({
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

  getSelectedJobId(item: any) {
    this.selectedJobId = item.data.id;
  }

  statusUpdate(id: number, status: any) {
    this.generalService.startLoading();
    this.jobService.statusUpdate(id, status).subscribe({
      next: (data) => {
        this.notificationService.showSuccess('Success', data.message);
        this.list();
        this.generalService.loaded();
      },
    });
  }

  delete(jobId: string) {
    // if (
    //   this.reason == '' ||
    //   this.reason == undefined ||
    //   this.reason.length < 1
    // ) {
    //   this.notificationService.showError('Failed', 'Please enter valid reason');
    //   return;
    // }

    this.generalService.startLoading();
    this.jobService.deleteWithMessage(jobId).subscribe({
      next: (data) => {
        this.notificationService.showSuccess('Success', data.message);
        this.list();
        // this.reason = '';
        this.generalService.loaded();
      },
    });
  }

  selectJob(jobId: string) {
    this.selectedJobId = jobId;
  }
}

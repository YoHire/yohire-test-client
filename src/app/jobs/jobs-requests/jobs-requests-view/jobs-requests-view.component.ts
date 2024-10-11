import { Component, OnInit } from '@angular/core';
import { JobRequests } from 'src/app/models/jobRequests';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from 'src/app/models/apiResponse';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { JobRequestService } from 'src/app/services/job-request.service';
import { JobRequestDetailedResponse } from 'src/app/models/job-request-detailed-response';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { RoleName } from 'src/app/models/roleName';
import { JobQuestions } from 'src/app/models/jobQuestions';
import { JobRequestAnswer } from 'src/app/models/job_request_answer';
import { JobService } from 'src/app/services/job.service';
import { JobDetailedResponse } from 'src/app/models/job-detailed-response';
import { JobResponse } from 'src/app/models/jobResponse';

@Component({
  selector: 'app-jobs-requests-view',
  templateUrl: './jobs-requests-view.component.html',
})
export class JobsRequestsViewComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private jobRequestService: JobRequestService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    public pageLocation: Location,
    private jobService: JobService,
    private authService: AuthService
  ) {}

  role: RoleName | null = null;
  data: any | null = null;
  jobRequestId: any;
  jobId: any;
  remark: string | any;
  apiUrl = environment.apiUrl;
  isEdit: boolean = false;
  jobQuestions: JobQuestions[] = [];

  questions: JobRequestAnswer[] = [];

  job: any | any;
  tags: string[] | any;
  selectedTags: string[] = [];
  loginUser: string = '';

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';
    this.role = this.authService.getCurrentUserRole();
    this.activatedRoute.params.subscribe((params) => {
      this.jobRequestId = params['id'];
      this.jobId = params['jobId'];
      this.getJobRequest(this.jobId, this.jobRequestId);
    });
    this.isEditable();
    this.getJob();
  }

  getJob() {
    this.generalService.startLoading();
    this.jobService.getJob(this.jobId).subscribe({
      next: (items: ApiResponse<JobDetailedResponse>) => {
        this.job = items.data;
        this.tags = this.job.filterTags.split(',');
        this.generalService.loaded();
      },
    });
  }

  checkSelection(tag: string) {
    let val = false;
    const index: number = this.selectedTags.indexOf(tag);
    if (index !== -1) {
      val = true;
    }
    return val;
  }

  isEditable() {
    this.isEdit = this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN);
  }
  getJobRequest(jobId: any, jobRequestId: any) {
    this.generalService.startLoading();
    this.jobRequestService
      .fetch(jobId, jobRequestId)
      .subscribe((items: ApiResponse<JobRequestDetailedResponse>) => {
        this.data = items.data;
        // this.selectedTags = this.data!.filterTags.split(',');

        // this.questions = items.data.jobRequestAnswerResponse;
        // this.notificationService.showSuccess(items.message,'Success');
        this.generalService.loaded();
      });
  }

  back() {
    this.pageLocation.back();
  }

  verify(item: any) {
    this.generalService.startLoading();
    let verifyData: any = {};
    verifyData.jobRequestId = this.jobRequestId;
    verifyData.verify = item;
    verifyData.remark = this.remark;
    this.jobRequestService.verify(this.jobId, verifyData).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.generalService.loaded();
        this.back();
      },
    });
  }

  nullCheck(value: any, show: Boolean = true) {
    if (value != null && value != undefined && value != '' && value != 'null') {
      if (!show && this.role != 'SUPER_ADMIN') {
        var val = value[0];
        for (let index = 0; index < value.length - 2; index++) {
          val += '*';
        }
        val += value[value.length - 1];
        return val;
      }
      return value;
    }
    return 'NIL';
  }

  public download(downloadUrl: string): void {
    window.open('http://localhost/images/' + downloadUrl, '_blank');
  }

  updateStatus(status: boolean) {
    this.jobRequestService
      .updateStatus(
        this.jobId,
        this.data!.id.toString(),
        this.remark,
        status ? 'ACCEPTED' : 'REJECTED'
      )
      .subscribe({
        next: () => {
          // this.ngOnInit();
          this.back();
        },
      });
  }
}

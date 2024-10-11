import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ApiResponse } from 'src/app/models/apiResponse';
import { JobQuestions } from 'src/app/models/jobQuestions';
import { JobResponse } from 'src/app/models/jobResponse';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { URL } from 'src/app/constants/constants';
import { GeneralService } from 'src/app/services/general.service';
import { JobSkillService } from 'src/app/services/job-skill.service';
import { JobService } from 'src/app/services/job.service';
import { NotificationService } from 'src/app/services/notification.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-jobs-view',
  templateUrl: './jobs-view.component.html',
})
export class JobsViewComponent implements OnInit {
  imageUrl = URL.IMAGE;
  // data: UserFetchResponse | null = null;
  role: RoleName | null = null;
  jobId: number = 0;
  job: any;
  addForm: FormGroup | any;
  jobQuestions: JobQuestions[] = [];
  amount: number = 0;

  questions: any;
  selectedSkills: any;
  loginUser: string = '';
  trackByItemId = trackByItemId;

  constructor(
    private activatedRoute: ActivatedRoute,
    private jobService: JobService,
    private jobSkillService: JobSkillService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    public pageLocation: Location
  ) {
    // this.currency = this.generalService.currency;
    this.activatedRoute.params.subscribe((params) => {
      this.jobId = params['id'];
      this.getJob();
      this.jobSkillList();
    });
  }

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.role = this.authService.getCurrentUserRole();
  }

  jobSkillList() {
    this.generalService.startLoading();
    this.jobSkillService.list(this.jobId, 'ACTIVE').subscribe({
      next: (item: any) => {
        this.selectedSkills = item.data;
        this.generalService.loaded();
      },
    });
  }

  getJob() {
    this.generalService.startLoading();
    this.jobService.getJob(this.jobId).subscribe({
      next: (items: ApiResponse<any>) => {
        this.job = items.data;
        this.generalService.loaded();
        this.amount = this.job.amount;
        // this.questions = items.data.questions;
        // this.jobQuestions = items.data.questions;
      },
    });
  }

  get form() {
    return this.addForm.controls;
  }

  nullCheck(value: any) {
    if (value != null && value != undefined && value != '' && value != 'null') {
      return value;
    }
    return 'NIL';
  }

  nullCheckWeight(value: any) {
    if (value != null && value != undefined && value != '' && value != 'null') {
      return value;
    }
    return 'NIL';
  }

  nullCheckHeight(value: any) {
    if (value != null && value != undefined && value != '' && value != 'null') {
      return value;
    }
    return 'NIL';
  }

  back() {
    this.pageLocation.back();
  }

  verify(id: any) {
    this.generalService.startLoading();
    this.jobService.verify(id).subscribe((data) => {
      this.notificationService.showSuccess(data.message, 'Success');
      this.job.verified = true;
      this.generalService.loaded();
    });
  }

  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 13) {
      this.job.amount = this.amount;
      this.saveJob(this.job);
      return false;
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) {
      return false;
    }
    return true;
  }
  formatQualification(qual: any): string {
    const { category, course, subCategory } = qual;

    if (
      category === 'HIGHER SECONDARY' ||
      category === 'BELOW 10th' ||
      category === 'SSLC'
    ) {
      return category;
    }
    let qualification = category;

    if (course) {
      qualification += ` - ${course}`;
    }

    if (subCategory) {
      qualification += ` (${subCategory})`;
    }

    return qualification;
  }
  saveJob(job: any) {
    var addForm = new UntypedFormGroup(
      {
        title: new UntypedFormControl(job.title, [Validators.required]),
        description: new UntypedFormControl(job.description),
        categoryId: new UntypedFormControl(job.category.id, [
          Validators.required,
          Validators.min(1),
        ]),
        subCategoryId: new UntypedFormControl(job?.subCategory?.id),
        company: new UntypedFormControl(job.company, [Validators.required]),
        country: new UntypedFormControl(job.country, [Validators.required]),
        salary: new UntypedFormControl(job.salary),
        amount: new UntypedFormControl(job.amount),
        contract: new UntypedFormControl(job.contract),
        expiryDate: new UntypedFormControl(
          moment.utc(job.expiryDate).format('DD-MM-yyyy'),
          [Validators.required]
        ),
        interviewDate: new UntypedFormControl(
          moment.utc(job.interviewDate).format('DD-MM-yyyy HH:mm')
        ),
        interviewVenue: new UntypedFormControl(job.interviewVenue),
        location: new UntypedFormControl(job.location, [Validators.required]),
        candidateCount: new UntypedFormControl(job.candidateCount, [
          Validators.required,
        ]),
        questions: new UntypedFormControl(this.questions, [
          Validators.required,
        ]),
      },
      { updateOn: 'change' }
    );

    this.jobService.update(this.jobId, addForm.value).subscribe({
      next: (data: ApiResponse<JobResponse>) => {
        this.notificationService.showSuccess(data.message, 'Success');
      },
    });
  }
}

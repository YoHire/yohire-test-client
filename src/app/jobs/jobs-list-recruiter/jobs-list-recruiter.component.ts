import { Location } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from 'src/app/models/apiResponse';
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
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-jobs-list-recruiter',
  templateUrl: './jobs-list-recruiter.component.html',
})
export class JobsListRecruiterComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private jobService: JobService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    public pageLocation: Location,
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.kycForm = this.fb.group({
      raid: ['', Validators.required],
      licenseNo: ['', Validators.required],
      gstNo: ['', Validators.required],
      authSignEmail: ['', [Validators.required, Validators.email]],
      authSignPhone: ['', Validators.required],
    });
  }
  @ViewChild('callAPIDialog')
  callAPIDialog!: TemplateRef<any>;
  @ViewChild('callAPIVerification')
  callAPIVerification!: TemplateRef<any>;
  imageUrl = URL.IMAGE;
  jobId: number = 0;
  job: JobResponse | any;
  // data: UserFetchResponse | null = null;
  // role: RoleName | null = null;
  items: any;
  itemsFiltered: any;

  categories: any;
  subCategories: SubCategoryResponse[] = [];

  pageCount: number = 0;
  page: number = 0;
  size: number = 10;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  sortedColumn = 'name';
  sortedDirection = 'asc';

  status: string = 'ACTIVE';
  categoryId: number = 0;

  selectedTab: string = 'running';
  loginUser: string = '';
  data: UserResponse | any;
  kycForm!: FormGroup;
  formSubmitted: boolean = false;
  trackByItemId = trackByItemId;

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';
    this.activatedRoute.params.subscribe((params) => {
      this.selectedTab = params['tab'] ?? 'running';
    });
    this.getUser();
  }
  getUser() {
    this.generalService.startLoading();
    this.userService
      .getUser(this.authService.currentUserValue.user.id)
      .subscribe((items: ApiResponse<UserResponse>) => {
        this.data = items.data;
        this.generalService.loaded();
      });
  }


  onSubmit() {
    this.formSubmitted = true;
    if (this.kycForm.valid) {
      const kycData = this.kycForm.value;
      this.userService.updateRecruiterKyc(kycData).subscribe({
        next: (items: any) => {
          this.notificationService.showSuccess('Success', items.message);
          this.dialog.closeAll();
          this.kycForm.reset();
          this.getUser();
        },
        error: (error: string) => {
          this.notificationService.showError(error, 'Failed');
          this.generalService.loaded();
        },
      });
    }
  }

  setSelectedTab(tab: string): void {
    this.selectedTab = tab;
  }
}

import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DashboardResponse } from 'src/app/models/dashboard-response';
import { RoleName } from 'src/app/models/roleName';
import { User } from 'src/app/models/user';
import { UserResponse } from 'src/app/models/user-response';
import { AuthService } from 'src/app/services/auth.service';
import { COUNTRIES, URL } from 'src/app/constants/constants';
import { GeneralService } from 'src/app/services/general.service';
import { JobService } from 'src/app/services/job.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { ApexAxisChartSeries, ApexXAxis } from 'ng-apexcharts';

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexTheme,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
import { trackByItemId } from 'src/app/utils/track-by.utils';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  theme: ApexTheme;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  @Input() chart!: ApexChart;
  @Input() series!: ApexAxisChartSeries | ApexNonAxisChartSeries;
  @Input() xaxis!: ApexXAxis;
  reliabilityScore: string = '';
  tooltipMessage: any = '';
  countryCodes = COUNTRIES;
  valueColor: string = 'Gold';
  isSubmitting: boolean = false;
  value: number = 0;
  profileForm!: FormGroup;
  options: any;
  tooltipVisible: boolean = false;
  uploadedImageUrls: any[] = [];
  uploadUrl: string = `${URL.UPLOAD}?type=company`;
  isNeverShowAgainChecked: boolean = false;
  linkTypes = [
    { label: 'X (Twitter)', value: 'X' },
    { label: 'Facebook', value: 'FACEBOOK' },
    { label: 'Instagram', value: 'INSTAGRAM' },
    { label: 'Website', value: 'WEBSITE' },
    { label: 'GitHub', value: 'GITHUB' },
    { label: 'LinkedIn', value: 'LINKEDIN' },
  ];
  @ViewChild('callAPIDialog') callAPIDialog!: TemplateRef<any>;
  @ViewChild('callAPIVerification') callAPIVerification!: TemplateRef<any>;
  showComplete: boolean = true;
  profileDialog: boolean = false;
  userData: User = this.authService.currentUserValue.user;
  totalApplicants!: number;
  totalResumeDownloads!: number;
  imageUrl = URL.IMAGE;
  userId: any;
  data: UserResponse | any;
  dashboardData: DashboardResponse | any;
  totalJobs!: number;
  totalTransactions!: number;
  totalInvitations!: number;
  jobsByMonth!: any;
  trendingJobs!: any;
  public chartOptions: any;
  loginUser: string = '';
  role: RoleName | null = null;
  trackByItemId = trackByItemId;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private jobService: JobService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    private router: Router,
    public dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';
    this.userId = this.authService.currentUserValue.user.id;
    if (this.userId.length > 0) {
      this.getUser();
    }
    this.getRole();
    this.dashboard();
    this.profileForm = this.fb.group({
      ra: [''],
      mobile: [''],
      countryCode: [''],
      address: [''],
      bio: [''],
      email: [''],
      socialLinks: this.fb.array([]),
    });
    this.addMobileValidation();
  }

  getAvailableLinkTypes(index: number): any[] {
    const selectedTypes = this.socialLinks.controls
      .map((control) => control.get('type')?.value)
      .filter((type) => type);

    return this.linkTypes.filter(
      (linkType) =>
        !selectedTypes.includes(linkType.value) ||
        this.socialLinks.at(index).get('type')?.value === linkType.value
    );
  }

  calculateReliabilityScore(): void {
    const mobile = this.profileForm.get('mobile')?.value;
    const bio = this.profileForm.get('bio')?.value;
    const address = this.profileForm.get('address')?.value;

    let score = 0;
    const criteria = [
      { value: this.data?.ra, weight: 20 },
      { value: mobile, weight: 20 },
      { value: address, weight: 10 },
      { value: bio, weight: 10 },
      { value: this.uploadedImageUrls.length, weight: 20 },
      { value: this.socialLinks.length, weight: 20 },
    ];

    criteria.forEach((criterion) => {
      if (typeof criterion.value === 'number') {
        score += (criterion.value / 5) * criterion.weight;
      } else if (criterion.value) {
        score += criterion.weight;
      }
    });

    this.value = Math.min(score, 100);
    this.reliabilityScore = `Reliability Score: ${this.value}%`;
    const { color, tooltip } = this.getColorAndTooltipBasedOnScore(this.value);
    this.valueColor = color;
    // this.tooltipMessage = tooltip;
    // this.showTooltip();
  }
  showTooltip(): void {
    this.tooltipVisible = true;
    setTimeout(() => {
      this.tooltipVisible = false;
    }, 2000);
  }

  getColorAndTooltipBasedOnScore(score: number): {
    color: string;
    tooltip: string;
  } {
    if (score >= 80) {
      return { color: 'Green', tooltip: "🎉 Great job! You're at the top!" };
    } else if (score >= 60) {
      return { color: 'Orange', tooltip: '👍 Good effort! Keep it up!' };
    } else if (score >= 40) {
      return { color: 'Yellow', tooltip: "😊 You're on the right track!" };
    } else {
      return { color: 'Red', tooltip: '🚀 Needs improvement, keep pushing!' };
    }
  }

  validateNumber(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  createSocialLink(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
    });
  }
  onUpload() {
    this.getImages();
  }
  getImages() {
    this.generalService.startLoading();
    this.userService.getUser(this.userId).subscribe((items: any) => {
      this.uploadedImageUrls = items.data.companyImages;
      this.calculateReliabilityScore();
      this.generalService.loaded();
    });
  }

  getUser() {
    this.generalService.startLoading();
    this.userService.getUser(this.userId).subscribe((items: any) => {
      this.data = items.data;
      const isProfileIncomplete =
        !this.data.mobile ||
        !this.data.address ||
        !this.data.bio ||
        this.data.socialLinks.length < 5 ||
        this.data.companyImages.length < 5;
      this.profileDialog = isProfileIncomplete && !items.data.neverShowDialog;
      this.uploadedImageUrls = items.data.companyImages;
      this.loadData(this.data);
      this.calculateReliabilityScore();
      this.generalService.loaded();
    });
  }
  loadData(data: any | null) {
    if (data) {
      this.profileForm.patchValue({
        ra: data.ra,
        mobile: data.mobile,
        countryCode: data.countryCode,
        bio: data.bio,
        address: data.address,
        email: data.email,
      });
      if (data.socialLinks && data.socialLinks.length > 0) {
        this.setSocialLinks(data.socialLinks);
      }
    }
  }
  get socialLinks(): FormArray {
    return this.profileForm.get('socialLinks') as FormArray;
  }

  private setSocialLinks(socialLinks: any[]) {
    const socialLinksFormArray = this.socialLinks;
    socialLinksFormArray.clear();
    socialLinks.forEach((link) => {
      socialLinksFormArray.push(
        this.fb.group({
          type: [link.platform || '', Validators.required],
          url: [
            link.url || '',
            [Validators.required, Validators.pattern('https?://.+')],
          ],
        })
      );
    });
  }

  renderChart() {
    this.chartOptions = {
      series: [
        this.totalApplicants,
        this.totalResumeDownloads,
        this.totalJobs,
        this.totalTransactions,
      ],
      chart: {
        width: 370,
        type: 'pie',
      },
      labels: [
        'Total Applicants',
        'Total Downloads',
        'Total Jobs',
        'Total Transactions',
      ],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
    this.series = [
      {
        name: 'Jobs',
        data: [...this.jobsByMonth],
      },
    ];

    this.chart = {
      type: 'line',
      height: 250,
    };

    this.xaxis = {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    };
  }
  areAllSeriesEmpty(): boolean {
    return this.totalApplicants +
      this.totalResumeDownloads +
      this.totalJobs +
      this.totalTransactions ===
      0
      ? true
      : false;
  }
  deleteImage(index: number) {
    const imageToDelete = this.uploadedImageUrls[index];
    this.userService.deleteImage(imageToDelete.id).subscribe({
      next: () => {
        this.uploadedImageUrls.splice(index, 1);
        this.calculateReliabilityScore();
      },
    });
  }

  addSocialLink(): void {
    const linkGroup = this.fb.group({
      type: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
    });
    this.socialLinks.push(linkGroup);
    this.calculateReliabilityScore();
  }

  removeSocialLink(index: number): void {
    this.socialLinks.removeAt(index);
    this.calculateReliabilityScore();
  }

  addMobileValidation() {
    this.profileForm.get('mobile')?.valueChanges.subscribe((mobile) => {
      if (mobile) {
        this.profileForm.get('countryCode')?.setValidators(Validators.required);
      } else {
        this.profileForm.get('countryCode')?.clearValidators();
      }
      this.profileForm.get('countryCode')?.updateValueAndValidity();
    });
  }

  onSubmit() {
    this.isSubmitting = true;
    if (!this.profileForm.valid) {
      this.notificationService.showError(
        'Failed',
        'Please fill all the required fields'
      );
      return;
    }
    this.userService
      .updateRecruiter(this.userId, {
        ...this.profileForm.value,
        neverShowValue: this.isNeverShowAgainChecked,
      })
      .subscribe({
        next: (data) => {
          this.notificationService.showSuccess('Success', data.message);
          this.getUser();
          this.profileDialog = !this.profileDialog;
          this.generalService.loaded();
        },
      });
  }

  canAddLink(): boolean {
    return this.socialLinks.controls.every((control) => control.valid);
  }

  dashboard() {
    this.generalService.startLoading();
    this.jobService.dashboard().subscribe({
      next: (items: any) => {
        this.dashboardData = items.data;
        this.totalApplicants = this.dashboardData?.totalApplicants;
        this.totalResumeDownloads = this.dashboardData?.totalResumeDownloads;
        this.totalJobs = this.dashboardData?.totalJobs;
        this.totalTransactions = this.dashboardData?.totalTransactions;
        this.totalInvitations = this.dashboardData?.invitedJobs;
        this.jobsByMonth = this.dashboardData?.jobsByMonth;
        this.trendingJobs = this.dashboardData?.trendingJobs;
        this.renderChart();
        this.generalService.loaded();
      },
    });
  }

  getRole() {
    if (this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN)) {
      this.router.navigate(['/home/dashboard-admin']);
    } else if (this.authService.hasRole(RoleName.ROLE_ADMIN)) {
      this.router.navigate(['/jobs/admin/list']);
    } else if (this.authService.hasRole(RoleName.ROLE_RECRUITER)) {
      this.router.navigate(['/home/dashboard']);
    }
  }
  onNeverShowAgainChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isNeverShowAgainChecked = checkbox.checked;
  }
  onClosingDialog(): void {
    this.userService
      .updateRecruiter(this.userId, {
        neverShowAgain: this.isNeverShowAgainChecked,
      })
      .subscribe({
        next: () => {
          this.generalService.loaded();
        },
      });
  }
}

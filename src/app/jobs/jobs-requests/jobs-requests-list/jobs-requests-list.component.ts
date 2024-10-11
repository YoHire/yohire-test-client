import { Location } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { URL } from 'src/app/constants/constants';
import { GeneralService } from 'src/app/services/general.service';
import { JobRequestService } from 'src/app/services/job-request.service';
import { NotificationService } from 'src/app/services/notification.service';
import { JobRequestAnswer } from 'src/app/models/job_request_answer';
import { JobService } from 'src/app/services/job.service';
import { PaytmService } from 'src/app/services/paytm.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { Transactions } from 'src/app/models/transactions';
import { MatDialog } from '@angular/material/dialog';
import { PaymentsService } from 'src/app/services/payments.service';
import { WindowRefService } from 'src/app/services/window-ref.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { razorKey } from 'src/app/layout/sidebar-recruiter/sidebar-recruiter.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtAuthResponse } from 'src/app/models/jwtAuthResponse';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { trackByItemId } from 'src/app/utils/track-by.utils';
import jsPDF from 'jspdf';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-jobs-requests-list',
  templateUrl: './jobs-requests-list.component.html',
})
export class JobsRequestsListComponent implements OnInit {
  private currentUserSubject: BehaviorSubject<JwtAuthResponse> =
    new BehaviorSubject<any>('');
  public currentUser: Observable<any> = this.currentUserSubject.asObservable();
  constructor(
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private jobRequestService: JobRequestService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    public pageLocation: Location,
    private jobService: JobService,
    private paytmService: PaytmService,
    private paymentsService: PaymentsService,
    private winRef: WindowRefService,
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {}

  @ViewChild('callAPIDialog')
  callAPIDialog!: TemplateRef<any>;

  coinForm!: FormGroup;
  coinBalance!: any;
  coinAmount!: number;
  @ViewChild('pdfTable', { static: false }) el!: ElementRef;

  role: RoleName | null = null;
  imageUrl: string = URL.IMAGE;
  jobRequests: any;
  jobId: any;
  itemsFiltered: any;
  downloadedItemsFiltered: any;
  selectedCandidates: string[] = [];
  transactions: Transactions | undefined;

  pageCount: number = 0;
  page: number = 0;
  size: number = 20;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  verified: any = 0;
  status: any = 2;
  catId: number = 0;

  noOfCandidates: number = 0;
  totalAmount: number = 0;

  sortedColumn = 'candidate.name';
  sortedDirection = 'asc';
  freecoinBalance!: any;
  selectAllApplications: boolean = false;
  selectAllDownloaded: boolean = false;

  questions: JobRequestAnswer[] = [];

  job: any;
  selectAll: boolean = false;
  isApplicationsDownload: boolean = false;
  isDownloadedDownload: boolean = false;
  loginUser: string = '';
  userData: any = this.authService.currentUserValue.user;
  gstAmount: number = 1.18;
  trackByItemId = trackByItemId;

  ngOnInit(): void {
    this.getCoinBalance();
    this.coinForm = this.formBuilder.group({
      coinAmount: [
        null,
        [Validators.required, Validators.min(1), Validators.max(10000)],
      ],
    });
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';
    this.role = this.authService.getCurrentUserRole();
    this.activatedRoute.params.subscribe((params) => {
      this.jobId = params['jobId'];
      this.listJobRequests(this.jobId);
      this.getJob();
    });
  }
  isAddressMatch(itemAddress: string) {
    const normalizedItemAddress = itemAddress.toLowerCase().trim();
    if (!this.job.targetLocation) {
      return 0;
    }
    const normalizedTargetLocation = this.job.targetLocation
      .toLowerCase()
      .trim();

    return normalizedItemAddress.includes(normalizedTargetLocation) ||
      normalizedTargetLocation.includes(normalizedItemAddress)
      ? 100
      : 0;
  }

  languagesReadAndWriteMatch(languages: any) {
    const jobLanguages = this.job.languagesReadWrite.map((lang: string) =>
      lang.toLowerCase()
    );
    const userLanguages = languages.map((lang: string) => lang.toLowerCase());
    const matches = jobLanguages.filter((name: any) =>
      userLanguages.includes(name)
    ).length;
    const totalLanguages = jobLanguages.length;
    let score = 0;
    if (matches > 0 && totalLanguages > 0) {
      score = (matches / totalLanguages) * 100;
    }
    return Math.round(score);
  }
  languagesSpeak(languages: any) {
    const jobLanguages = this.job.languagesSpeak.map((lang: string) =>
      lang.toLowerCase()
    );
    const userLanguages = languages.map((lang: string) => lang.toLowerCase());
    const matches = jobLanguages.filter((name: any) =>
      userLanguages.includes(name)
    ).length;
    const totalLanguages = jobLanguages.length;
    let score = 0;
    if (matches > 0 && totalLanguages > 0) {
      score = (matches / totalLanguages) * 100;
    }
    return Math.round(score);
  }
  getColor(score: number): string {
    if (score === 20) {
      return 'red';
    } else if (score === 40) {
      return 'blue';
    } else if (score === 60) {
      return 'orange';
    } else if (score === 80) {
      return 'yellow';
    } else if (score === 100) {
      return 'green';
    } else {
      return 'black';
    }
  }

  getCoinBalance() {
    this.userService.getUserCoinBalance().subscribe((response) => {
      this.coinBalance = response.data.coin;
      this.freecoinBalance = response.data.freeCoin;
    });
  }

  getJob() {
    this.generalService.startLoading();
    this.jobService.getJob(this.jobId).subscribe({
      next: (items: any) => {
        this.job = items.data;
        this.generalService.loaded();
      },
    });
  }
  checkMatchAge(age: any) {
    const userAge = this.calculateAge(age);
    if (userAge >= this.job.minAge && userAge <= this.job.maxAge) {
      return 100;
    }
    return 0;
  }

  checkWeightMatch(weight: any) {
    if (weight >= this.job.minWeight && weight <= this.job.maxWeight) {
      return 100;
    }
    return 0;
  }
  checkHeightMatch(height: any) {
    if (height >= this.job.minHeight && height <= this.job.maxHeight) {
      return 100;
    }
    return 0;
  }
  calculateAge(dateOfBirth: any) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
  checkMatches(userJobs: any[], jobCategories: any[]): number {
    if (!Array.isArray(userJobs) || !Array.isArray(jobCategories)) {
      return 0;
    }
    const userJobNames = userJobs.map((job) => job.name.toLowerCase());
    const jobCategoryNames = jobCategories.map((category) =>
      category.name.toLowerCase()
    );
    const matches = jobCategoryNames.filter((name) =>
      userJobNames.includes(name)
    ).length;
    const totalCategories = jobCategoryNames.length;
    let score = 0;

    if (matches > 0 && totalCategories > 0) {
      score = (matches / totalCategories) * 100;
    }

    return Math.round(score);
  }
  isSkillMatching(jobSkill: any, userSkills: any[]): boolean {
    return userSkills.some(
      (userSkill) =>
        userSkill.name.toLowerCase() === jobSkill.name.toLowerCase()
    );
  }
  checkCategoryMatches(jobCategory: any, userCategories: any[]): boolean {
    if (!Array.isArray(userCategories)) {
      return false;
    }

    const jobCategoryName = jobCategory.name.toLowerCase();
    return userCategories.some(
      (userCat) => userCat.name.toLowerCase() === jobCategoryName
    );
  }

  isLanguageMatching(jobLanguage: any, userLanguages: any[]): boolean {
    return userLanguages.some(
      (userLanguage) => userLanguage.toLowerCase() === jobLanguage.toLowerCase()
    );
  }
  checkCatgoryMatches(userJobs: any[], jobCategories: any[]): number {
    const userJobNames = userJobs.map((job) => job.name.toLowerCase());
    const jobCategoryNames = jobCategories.map((category) =>
      category.name.toLowerCase()
    );
    const matches = jobCategoryNames.filter((name) =>
      userJobNames.includes(name)
    ).length;
    const totalCategories = jobCategoryNames.length;
    let score = 0;

    if (matches > 0 && totalCategories > 0) {
      score = (matches / totalCategories) * 100;
    }

    return Math.round(score);
  }

  checkSkillsMatch(itemSkills: any[], jobSkills: any[]): boolean {
    if (!Array.isArray(itemSkills) || !Array.isArray(jobSkills)) {
      return false;
    }
    const itemSkillNames = itemSkills.map((skill) => skill.name);
    const jobSkillNames = jobSkills.map((skill) => skill.name);
    return itemSkillNames.every((skillName) =>
      jobSkillNames.includes(skillName)
    );
  }
  listJobRequests(jobId: any) {
    this.generalService.startLoading();
    this.jobRequestService.list(jobId).subscribe({
      next: (items: any) => {
        this.jobRequests = items.data;
        this.itemsFiltered = [
          ...this.jobRequests.filter(
            (item: { resumeDownloaded: any }) => !item.resumeDownloaded
          ),
        ];
        this.downloadedItemsFiltered = [
          ...this.jobRequests.filter(
            (item: { resumeDownloaded: any }) => item.resumeDownloaded
          ),
        ];

        this.paginateItems();
        this.generalService.loaded();
      },
    });
  }

  back() {
    this.pageLocation.back();
  }

  customFilter(event: any) {
    const val = event.target.value.toLowerCase();

    const temp = this.jobRequests.filter(function (d: any) {
      let filter1 = d.username.toLowerCase().indexOf(val) !== -1;
      let filter2 = d.email.toLowerCase().indexOf(val) !== -1;
      let filter3 = d.mobile.toLowerCase().indexOf(val) !== -1;
      let filter4 = d.category
        ? d.category.name.toLowerCase().indexOf(val) !== -1
        : '';
      return filter1 || filter2 || filter3 || filter4 || !val;
    });
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

  generateOrder() {
    this.paymentsService
      .createOrder({
        amount: this.coinAmount * 50 * this.gstAmount * 100,
        role: this.userData.authorities[0],
        currency: 'INR',
        coinToAdd: this.coinAmount,
      })
      .subscribe(
        (response) => {
          this.payWithRazorpay(response.data);
        },
        (error) => {
          console.error('Error occurred while creating order:', error);
        }
      );
  }
  payWithRazorpay(orderId: string) {
    var options: any = {
      key: razorKey,
      amount: this.coinAmount * 50 * this.gstAmount * 100,
      currency: 'INR',
      name: 'yoHire',
      description: 'Test Transaction',
      image: 'assets/img/yohire.png',
      order_id: orderId,
      modal: {
        escape: false,
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      notes: {
        address: 'yoHire India',
      },
      theme: {
        color: '#3399cc',
      },
    };
    options.handler = (response: any, error: any) => {
      options.response = response;
      if (response.razorpay_signature) {
        this.getCoinBalance();
        window.location.reload();
      }
    };
    options.modal.ondismiss = () => {
      this.notificationService.showError('Transaction Cancelled', 'Error');
    };
    const rzp = new this.winRef.nativeWindow.Razorpay(options);
    rzp.open();
    this.dialog.closeAll();
  }
  checkDownLoad(tab: string) {
    this.isDownloadedDownload = false;
    this.isApplicationsDownload = false;
    if (tab === 'applications') {
      for (let item of this.itemsFiltered) {
        if (item.downloadCheck) {
          this.isApplicationsDownload = true;
          break;
        }
      }
    } else if (tab === 'downloaded') {
      for (let item of this.downloadedItemsFiltered) {
        if (item.downloadCheck) {
          this.isDownloadedDownload = true;
          break;
        }
      }
    }
  }

  changeDownloadSelect(tab: string) {
    this.isDownloadedDownload = false;
    this.isApplicationsDownload = false;
    if (tab === 'applications') {
      for (let item of this.itemsFiltered) {
        item.downloadCheck = this.selectAllApplications;
        if (item.downloadCheck) this.isApplicationsDownload = true;
      }
    } else if (tab === 'downloaded') {
      for (let item of this.downloadedItemsFiltered) {
        item.downloadCheck = this.selectAllDownloaded;
        if (item.downloadCheck) this.isDownloadedDownload = true;
      }
    }
  }

  downloadSelectedItems() {
    const doc = new jsPDF({
      format: 'A4',
    });
    const logo = new Image();
    logo.src = 'assets/img/yohirelogo-1.png';

    logo.onload = async () => {
      let selectedItemsCount = 0;
      let selectedItems = [];
      let currentTabItems = [];
      this.selectedCandidates = [];
      if (
        document
          .getElementById('applications-tab')
          ?.classList.contains('active')
      ) {
        currentTabItems = this.itemsFiltered;
      } else if (
        document.getElementById('downloaded-tab')?.classList.contains('active')
      ) {
        currentTabItems = this.downloadedItemsFiltered;
      }

      for (let item of currentTabItems) {
        if (item.downloadCheck) {
          selectedItems.push(item);
          this.selectedCandidates.push(item.id);

          if (!item.resumeDownloaded) {
            selectedItemsCount++;
          }
        }
      }
      if (selectedItemsCount > this.coinBalance && this.freecoinBalance <= 0) {
        const dialogRef = this.dialog.open(this.callAPIDialog);
        dialogRef.afterClosed().subscribe(() => {});
        return;
      } else if (this.freecoinBalance && this.freecoinBalance > 0) {
        this.userService
          .updateFreeCoinBalance(
            this.jobId,
            selectedItemsCount,
            this.selectedCandidates
          )
          .subscribe({
            next: () => {
              this.processPDFDownload(selectedItems, doc);
            },
          });
      } else {
        this.generalService.startLoading();
        this.jobRequestService
          .updateJobRequirement(
            this.jobId,
            selectedItemsCount,
            this.selectedCandidates
          )
          .subscribe({
            next: () => {
              this.getCoinBalance();
              this.processPDFDownload(selectedItems, doc);
            },
          });
      }
    };
  }

  async processPDFDownload(selectedItems: any[], doc: jsPDF) {
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      await this.downloadPDFMultiple(item, doc, 30);
      if (i < selectedItems.length - 1) {
        doc.addPage();
      }
    }
    doc.save('Resumes.pdf');
    this.listJobRequests(this.jobId);
    this.getCoinBalance();
    window.location.reload();
    this.generalService.loaded();
  }

  exportToExcel(candidates: any[]): void {
    const selectedCandidates = candidates.filter(
      (candidate) => candidate.downloadCheck
    );
    const keys = Object.keys(selectedCandidates[0]);
    const excludedFields = [
      'id',
      'updatedAt',
      'createdAt',
      'refferalCode',
      'resumeDownloaded',
      'coinBalance',
      'tempCoinCount',
      'tempJobId',
      'username',
      'completedProfile',
      'fcmId',
      'passportPhoto',
      'profileImage',
      'refferedUsers',
      'role',
      'tempOrderId',
      'downloadCheck',
    ];
    const filteredKeys = keys.filter((key) => !excludedFields.includes(key));
    const csvHeader = filteredKeys.join(',') + '\n';
    const csvData = selectedCandidates
      .map((candidate) => {
        const values = filteredKeys.map((key) => {
          let value = candidate[key];
          if (Array.isArray(value)) {
            if (key === 'education') {
              value = value
                .map((edu) => `${edu.course} - ${edu.institution}`)
                .join('\n');
            } else if (key === 'workExperience') {
              value = value
                .map((exp) => `${exp.companyName} - ${exp.designation}`)
                .join('\n');
            } else if (key === 'skill') {
              value = value.map((skill) => skill.name).join('\n');
            } else {
              value = value.join(';');
            }
          } else if (key === 'ecr') {
            value = value ? 'Required' : 'Not Required';
          } else if (key === 'dateOfBirth' || key === 'passportExpiryDate') {
            const date = new Date(value);
            const formattedDate = `${date.getDate()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${date.getFullYear()}`;
            value = formattedDate;
          }
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value}"`;
          }
          return value;
        });
        return values.join(',');
      })
      .join('\n');
    const csvContent = csvHeader + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'candidates.csv';
    link.click();
  }

  async downloadPDF(job: any, type: string) {
    if (
      this.coinBalance <= 0 &&
      !job.resumeDownloaded &&
      this.freecoinBalance <= 0
    ) {
      const dialogRef = this.dialog.open(this.callAPIDialog);
      dialogRef.afterClosed().subscribe(() => {});
      return;
    }

    const doc = new jsPDF({
      format: 'A4',
    });

    const logo = new Image();
    logo.crossOrigin = environment.gCloudOrigin as string;
    logo.src = job.profileImage
      ? job.profileImage
      : 'assets/img/yohirelogo-1.png';
    logo.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;

      const addPage = () => {
        doc.addPage();
        currentY = margin;
      };

      const checkPageHeight = (currentY: number, additionalHeight: number) => {
        if (currentY + additionalHeight > pageHeight - margin) {
          addPage();
        }
      };

      const logoBase64 = getBase64Image(logo, 0.2);
      const imageX = margin;
      const imageY = margin;
      const imageWidth = 35;
      const imageHeight = 35;
      doc.addImage(logoBase64, 'PNG', imageX, imageY, imageWidth, imageHeight);

      currentY += imageHeight + 10;

      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(job?.username + ' ' + job?.surname, margin, currentY);

      currentY += 10;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Mobile: ' + job?.mobile, margin, currentY);
      currentY += 5;
      doc.text('Email: ' + job?.email, margin, currentY);
      currentY += 5;
      doc.text('Address: ' + job?.address, margin, currentY);
      currentY += 5;
      doc.text(`DOB: ${this.formatDate(job?.dateOfBirth)}`, margin, currentY);
      currentY += 5;
      if (job.resumeLink) {
        const linkText = 'View Resume';
        const resumeLink = job?.resumeLink || '#';

        const prefixText = 'Resume: ';
        doc.setTextColor(100, 100, 100);
        doc.text(prefixText, margin, currentY);

        const prefixWidth = doc.getTextWidth(prefixText);

        doc.setTextColor(0, 0, 255);
        doc.textWithLink(linkText, margin + prefixWidth, currentY, {
          url: resumeLink,
        });

        const linkWidth = doc.getTextWidth(linkText);
        doc.setDrawColor(0, 0, 255);
        doc.line(
          margin + prefixWidth,
          currentY + 0.5,
          margin + prefixWidth + linkWidth,
          currentY + 0.5
        );
      }
      if (job.drivingLicense || job.drivingLicenseBack) {
        currentY += 5;
        const frontLinkText = 'Front';
        const separatorText = ' | ';
        const backLinkText = 'Back';
        const drivingLicense = job?.drivingLicense || '#';
        const drivingLicenseBack = job?.drivingLicenseBack || '#';
        const prefixText = `Driving License: `;

        doc.setTextColor(100, 100, 100);
        doc.text(prefixText, margin, currentY);

        const prefixWidth = doc.getTextWidth(prefixText);
        let currentXPosition = margin + prefixWidth;
        doc.setTextColor(0, 0, 255);

        if (job.drivingLicense) {
          doc.textWithLink(frontLinkText, currentXPosition, currentY, {
            url: drivingLicense,
          });
          const frontLinkWidth = doc.getTextWidth(frontLinkText);

          doc.setDrawColor(0, 0, 255);
          doc.line(
            currentXPosition,
            currentY + 0.5,
            currentXPosition + frontLinkWidth,
            currentY + 0.5
          );

          currentXPosition += frontLinkWidth;
        }

        if (job.drivingLicense && job.drivingLicenseBack) {
          doc.setTextColor(0, 0, 0);
          doc.text(separatorText, currentXPosition, currentY);
          const separatorWidth = doc.getTextWidth(separatorText);
          currentXPosition += separatorWidth;
        }

        if (job.drivingLicenseBack) {
          doc.setTextColor(0, 0, 255);
          doc.textWithLink(backLinkText, currentXPosition, currentY, {
            url: drivingLicenseBack,
          });
          const backLinkWidth = doc.getTextWidth(backLinkText);
          doc.setDrawColor(0, 0, 255);
          doc.line(
            currentXPosition,
            currentY + 0.5,
            currentXPosition + backLinkWidth,
            currentY + 0.5
          );
        }
      }
      if (job.intlDrivingLicense || job.intlDrivingLicenseBack) {
        currentY += 5;
        const frontLinkText = 'Front';
        const separatorText = ' | ';
        const backLinkText = 'Back';
        const intlDrivingLicense = job?.intlDrivingLicense || '#';
        const intlDrivingLicenseBack = job?.intlDrivingLicenseBack || '#';
        const prefixText = `Intl Driving License: `;

        doc.setTextColor(100, 100, 100);
        doc.text(prefixText, margin, currentY);

        const prefixWidth = doc.getTextWidth(prefixText);
        let currentXPosition = margin + prefixWidth;
        doc.setTextColor(0, 0, 255);

        if (job.intlDrivingLicense) {
          doc.textWithLink(frontLinkText, currentXPosition, currentY, {
            url: intlDrivingLicense,
          });
          const frontLinkWidth = doc.getTextWidth(frontLinkText);
          doc.setDrawColor(0, 0, 255);
          doc.line(
            currentXPosition,
            currentY + 0.5,
            currentXPosition + frontLinkWidth,
            currentY + 0.5
          );

          currentXPosition += frontLinkWidth;
        }

        if (job.intlDrivingLicense && job.intlDrivingLicenseBack) {
          doc.setTextColor(0, 0, 0);
          doc.text(separatorText, currentXPosition, currentY);
          const separatorWidth = doc.getTextWidth(separatorText);
          currentXPosition += separatorWidth;
        }

        if (job.intlDrivingLicenseBack) {
          doc.setTextColor(0, 0, 255);
          doc.textWithLink(backLinkText, currentXPosition, currentY, {
            url: intlDrivingLicenseBack,
          });
          const backLinkWidth = doc.getTextWidth(backLinkText);

          doc.setDrawColor(0, 0, 255);
          doc.line(
            currentXPosition,
            currentY + 0.5,
            currentXPosition + backLinkWidth,
            currentY + 0.5
          );
        }
      }
      if (job.passportPhoto || job.passportPhotoBack) {
        currentY += 5;
        const frontLinkText = 'Front';
        const separatorText = ' | ';
        const backLinkText = 'Back';
        const passportPhoto = job?.passportPhoto || '#';
        const passportPhotoBack = job?.passportPhotoBack || '#';
        const prefixText = `Passport Photo: `;

        doc.setTextColor(100, 100, 100);
        doc.text(prefixText, margin, currentY);

        const prefixWidth = doc.getTextWidth(prefixText);
        let currentXPosition = margin + prefixWidth;
        doc.setTextColor(0, 0, 255);

        if (job.passportPhoto) {
          doc.textWithLink(frontLinkText, currentXPosition, currentY, {
            url: passportPhoto,
          });
          const frontLinkWidth = doc.getTextWidth(frontLinkText);

          doc.setDrawColor(0, 0, 255);
          doc.line(
            currentXPosition,
            currentY + 0.5,
            currentXPosition + frontLinkWidth,
            currentY + 0.5
          );

          currentXPosition += frontLinkWidth;
        }

        if (job.passportPhoto && job.passportPhotoBack) {
          doc.setTextColor(0, 0, 0);
          doc.text(separatorText, currentXPosition, currentY);
          const separatorWidth = doc.getTextWidth(separatorText);
          currentXPosition += separatorWidth;
        }

        if (job.passportPhotoBack) {
          doc.setTextColor(0, 0, 255);
          doc.textWithLink(backLinkText, currentXPosition, currentY, {
            url: passportPhotoBack,
          });
          const backLinkWidth = doc.getTextWidth(backLinkText);
          doc.setDrawColor(0, 0, 255);
          doc.line(
            currentXPosition,
            currentY + 0.5,
            currentXPosition + backLinkWidth,
            currentY + 0.5
          );
        }
      }

      currentY += 10;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Personal Information', margin, currentY);
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, currentY + 2, 80, currentY + 2);
      currentY += 10;

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      const personalInfo = [
        `Passport No: ${job?.passportNumber}`,
        `Passport Expiry Date: ${this.formatDate(job?.passportExpiryDate)}`,
        `ECR: ${job?.ecr ? 'Required' : 'Not Required'}`,
        `Height: ${job?.height}`,
        `Weight: ${job?.weight}`,
        `Gender: ${job?.gender}`,
        job?.maritialStatus ? `Marital Status: ${job?.maritialStatus}` : '',
      ];
      personalInfo.forEach((info) => {
        checkPageHeight(currentY, 6);
        doc.text(info, margin, currentY);
        currentY += 6;
      });

      currentY += 10;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Skills', margin, currentY);
      doc.line(margin, currentY + 2, 40, currentY + 2);
      currentY += 10;

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      let currentX = margin;
      job.skill.forEach((skill: { name: string }, index: number) => {
        const skillText =
          index === job.skill.length - 1 ? skill.name : skill.name + ', ';
        const skillWidth = doc.getTextWidth(skillText);

        if (currentX + skillWidth > pageWidth - margin) {
          currentY += 6;
          currentX = margin;
        }

        doc.text(skillText, currentX, currentY);
        currentX += skillWidth;
      });

      currentY += 10;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Languages Read & Write', margin, currentY);
      doc.line(margin, currentY + 2, 40, currentY + 2);
      currentY += 10;

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);

      currentX = margin;
      const languagesWrite = job.languagesWrite.join(', ');

      languagesWrite
        .split(', ')
        .forEach(
          (language: string | number, index: number, array: string | any[]) => {
            const languageText =
              language + (index < array.length - 1 ? ', ' : '');
            const languageWidth = doc.getTextWidth(languageText);

            if (currentX + languageWidth > pageWidth - margin) {
              currentY += 6;
              currentX = margin;
            }

            doc.text(languageText, currentX, currentY);
            currentX += languageWidth;
          }
        );

      currentY += 10;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Languages Speak', margin, currentY);
      doc.line(margin, currentY + 2, 40, currentY + 2);
      currentY += 10;

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);

      currentX = margin;
      const languagesRead = job.languagesRead.join(', ');

      languagesRead
        .split(', ')
        .forEach(
          (language: string | number, index: number, array: string | any[]) => {
            const languageText =
              language + (index < array.length - 1 ? ', ' : '');
            const languageWidth = doc.getTextWidth(languageText);

            if (currentX + languageWidth > pageWidth - margin) {
              currentY += 6;
              currentX = margin;
            }

            doc.text(languageText, currentX, currentY);
            currentX += languageWidth;
          }
        );

      currentY += 10;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Education', margin, currentY);
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, currentY + 2, 55, currentY + 2);
      currentY += 10;

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      const sortedEducation = job.education.sort(
        (
          a: { completedDate: string | number | Date },
          b: { completedDate: string | number | Date }
        ) => {
          const dateA = new Date(a.completedDate);
          const dateB = new Date(b.completedDate);
          return dateB.getTime() - dateA.getTime();
        }
      );

      sortedEducation.forEach(
        (
          edu: {
            institution: any;
            course: any;
            completedDate: any;
            certificate: any;
          },
          index: number
        ) => {
          checkPageHeight(currentY, 40);

          doc.setTextColor(0, 0, 0);
          doc.text(`Institution: ${edu.institution}`, margin, currentY + 5);
          doc.text(`Course: ${edu.course}`, margin, currentY + 10);
          doc.text(
            `Completed On: ${this.formatDate(edu.completedDate)}`,
            margin,
            currentY + 15
          );

          currentY += 20;

          if (edu.certificate) {
            const linkText = 'View Certificate';
            const resumeLink = edu?.certificate || '#';

            const prefixText = 'Certificate: ';
            doc.setTextColor(0, 0, 0);
            doc.text(prefixText, margin, currentY);

            const prefixWidth = doc.getTextWidth(prefixText);

            doc.setTextColor(0, 0, 255);
            doc.textWithLink(linkText, margin + prefixWidth, currentY, {
              url: resumeLink,
            });

            const linkWidth = doc.getTextWidth(linkText);
            doc.setDrawColor(0, 0, 255);
            doc.line(
              margin + prefixWidth,
              currentY + 0.5,
              margin + prefixWidth + linkWidth,
              currentY + 0.5
            );

            currentY += 18;

            doc.setTextColor(0, 0, 0); // Reset text color to default (black) for subsequent elements
            doc.setDrawColor(0, 0, 0); // Reset draw color to default (black) for subsequent elements
          }
        }
      );

      currentY += 10;
      if (job.workExperience && job.workExperience.length > 0) {
        const presentExperience = job.workExperience.filter(
          (experience: { endDate: any }) =>
            this.formatDate(experience.endDate) === '01-01-1900'
        );
        const pastExperience = job.workExperience.filter(
          (experience: { endDate: any }) =>
            this.formatDate(experience.endDate) !== '01-01-1900'
        );

        pastExperience.sort(
          (
            a: { endDate: string | number | Date },
            b: { endDate: string | number | Date }
          ) => {
            const dateA = new Date(a.endDate);
            const dateB = new Date(b.endDate);
            return dateB.getTime() - dateA.getTime();
          }
        );

        const sortedExperience = [...presentExperience, ...pastExperience];

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Work Experience', margin, currentY);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, currentY + 2, 70, currentY + 2);
        currentY += 10;
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);

        sortedExperience.forEach(
          (
            experience: {
              companyName: string | string[];
              designation: string | string[];
              startDate: any;
              endDate: any;
              certificate: any;
            },
            index: number
          ) => {
            checkPageHeight(currentY, 40);

            doc.setTextColor(0, 0, 0);

            const endDate = this.formatDate(experience.endDate);
            const isPresent = endDate === '01-01-1900';

            doc.text(
              `Company Name: ${experience.companyName}${
                isPresent ? ' (Present)' : ''
              }`,
              margin,
              currentY + 5
            );
            doc.text(
              `Designation: ${experience.designation}`,
              margin,
              currentY + 10
            );
            doc.text(
              `Start Date: ${this.formatDate(experience.startDate)}`,
              margin,
              currentY + 15
            );

            if (!isPresent) {
              doc.text(`End Date: ${endDate}`, margin, currentY + 20);
              currentY += 25;
            } else {
              currentY += 20;
            }

            if (experience.certificate) {
              const linkText = 'View Certificate';
              const certificateLink = experience?.certificate || '#';

              const prefixText = 'Certificate: ';
              doc.setTextColor(0, 0, 0);
              doc.text(prefixText, margin, currentY);

              const prefixWidth = doc.getTextWidth(prefixText);

              doc.setTextColor(0, 0, 255);
              doc.textWithLink(linkText, margin + prefixWidth, currentY, {
                url: certificateLink,
              });

              const linkWidth = doc.getTextWidth(linkText);
              doc.setDrawColor(0, 0, 255);
              doc.line(
                margin + prefixWidth,
                currentY + 0.5,
                margin + prefixWidth + linkWidth,
                currentY + 0.5
              );

              currentY += 18;

              doc.setTextColor(0, 0, 0);
              doc.setDrawColor(0, 0, 0);
            }
          }
        );
      }
      const totalHeight = currentY + 20;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated By', pageWidth - 50, totalHeight + 10);
      doc.setFontSize(10);
      doc.addImage(
        'assets/img/yohire-logo.png',
        'PNG',
        pageWidth - 30,
        totalHeight + 5,
        20,
        7
      );

      if (job.resumeDownloaded) {
        if (type === 'view') {
          const pdfBlob = doc.output('blob');
          const blobURL = (window as any).URL.createObjectURL(pdfBlob);
          window.open(blobURL);
          return;
        }
        doc.save(job.username + 'Resume.pdf');
      } else if (this.freecoinBalance && this.freecoinBalance > 0) {
        this.userService
          .updateFreeCoinBalance(this.jobId, 1, [job.id])
          .subscribe({
            next: () => {
              doc.save(job.username + 'Resume.pdf');
              this.listJobRequests(this.jobId);
              this.getCoinBalance();
              window.location.reload();
              this.generalService.loaded();
            },
          });
      } else {
        this.jobRequestService
          .updateJobRequirement(this.jobId, 1, [job.id])
          .subscribe({
            next: () => {
              this.getCoinBalance();
              doc.save(job.username + 'Resume.pdf');
              this.listJobRequests(this.jobId);
              window.location.reload();
              this.generalService.loaded();
            },
          });
      }

      function getBase64Image(img: any, quality: number) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx: any = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', quality);
      }
      if (type === 'view') {
        const pdfBlob = doc.output('blob');
        const blobURL = (window as any).URL.createObjectURL(pdfBlob);
        window.open(blobURL);
      }
    };
  }

  async downloadPDFMultiple(job: any, doc: any, p0: number) {
    const logo = new Image();
    logo.crossOrigin = environment.gCloudOrigin as string;
    logo.src = job.profileImage
      ? job.profileImage
      : 'assets/img/yohirelogo-1.png';

    return new Promise<void>((resolve) => {
      logo.onload = () => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let currentY = margin;

        const addPage = () => {
          doc.addPage();
          currentY = margin;
        };

        const checkPageHeight = (
          currentY: number,
          additionalHeight: number
        ) => {
          if (currentY + additionalHeight > pageHeight - margin) {
            addPage();
          }
        };

        const logoBase64 = getBase64Image(logo, 0.2);
        const imageX = margin;
        const imageY = margin;
        const imageWidth = 35;
        const imageHeight = 35;
        doc.addImage(
          logoBase64,
          'PNG',
          imageX,
          imageY,
          imageWidth,
          imageHeight
        );

        currentY += imageHeight + 10;

        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(job?.username + ' ' + job?.surname, margin, currentY);

        currentY += 10;
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Mobile: ' + job?.mobile, margin, currentY);
        currentY += 5;
        doc.text('Email: ' + job?.email, margin, currentY);
        currentY += 5;
        doc.text('Address: ' + job?.address, margin, currentY);
        currentY += 5;
        doc.text('DOB: 11/11/1999', margin, currentY);
        currentY += 5;

        if (job.resumeLink) {
          const linkText = 'View Resume';
          const resumeLink = job?.resumeLink || '#';

          const prefixText = 'Resume: ';
          doc.setTextColor(100, 100, 100);
          doc.text(prefixText, margin, currentY);

          const prefixWidth = doc.getTextWidth(prefixText);

          doc.setTextColor(0, 0, 255);
          doc.textWithLink(linkText, margin + prefixWidth, currentY, {
            url: resumeLink,
          });

          const linkWidth = doc.getTextWidth(linkText);
          doc.setDrawColor(0, 0, 255);
          doc.line(
            margin + prefixWidth,
            currentY + 0.5,
            margin + prefixWidth + linkWidth,
            currentY + 0.5
          );
        }
        if (job.drivingLicense || job.drivingLicenseBack) {
          currentY += 5;
          const frontLinkText = 'Front';
          const separatorText = ' | ';
          const backLinkText = 'Back';
          const drivingLicense = job?.drivingLicense || '#';
          const drivingLicenseBack = job?.drivingLicenseBack || '#';
          const prefixText = `Driving License: `;

          doc.setTextColor(100, 100, 100);
          doc.text(prefixText, margin, currentY);

          const prefixWidth = doc.getTextWidth(prefixText);
          let currentXPosition = margin + prefixWidth;
          doc.setTextColor(0, 0, 255);

          if (job.drivingLicense) {
            doc.textWithLink(frontLinkText, currentXPosition, currentY, {
              url: drivingLicense,
            });
            const frontLinkWidth = doc.getTextWidth(frontLinkText);

            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + frontLinkWidth,
              currentY + 0.5
            );

            currentXPosition += frontLinkWidth;
          }

          if (job.drivingLicense && job.drivingLicenseBack) {
            doc.setTextColor(0, 0, 0);
            doc.text(separatorText, currentXPosition, currentY);
            const separatorWidth = doc.getTextWidth(separatorText);
            currentXPosition += separatorWidth;
          }

          if (job.drivingLicenseBack) {
            doc.setTextColor(0, 0, 255);
            doc.textWithLink(backLinkText, currentXPosition, currentY, {
              url: drivingLicenseBack,
            });
            const backLinkWidth = doc.getTextWidth(backLinkText);
            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + backLinkWidth,
              currentY + 0.5
            );
          }
        }
        if (job.intlDrivingLicense || job.intlDrivingLicenseBack) {
          currentY += 5;
          const frontLinkText = 'Front';
          const separatorText = ' | ';
          const backLinkText = 'Back';
          const intlDrivingLicense = job?.intlDrivingLicense || '#';
          const intlDrivingLicenseBack = job?.intlDrivingLicenseBack || '#';
          const prefixText = `Intl Driving License: `;

          doc.setTextColor(100, 100, 100);
          doc.text(prefixText, margin, currentY);

          const prefixWidth = doc.getTextWidth(prefixText);
          let currentXPosition = margin + prefixWidth;
          doc.setTextColor(0, 0, 255);

          if (job.intlDrivingLicense) {
            doc.textWithLink(frontLinkText, currentXPosition, currentY, {
              url: intlDrivingLicense,
            });
            const frontLinkWidth = doc.getTextWidth(frontLinkText);
            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + frontLinkWidth,
              currentY + 0.5
            );

            currentXPosition += frontLinkWidth;
          }

          if (job.intlDrivingLicense && job.intlDrivingLicenseBack) {
            doc.setTextColor(0, 0, 0);
            doc.text(separatorText, currentXPosition, currentY);
            const separatorWidth = doc.getTextWidth(separatorText);
            currentXPosition += separatorWidth;
          }

          if (job.intlDrivingLicenseBack) {
            doc.setTextColor(0, 0, 255);
            doc.textWithLink(backLinkText, currentXPosition, currentY, {
              url: intlDrivingLicenseBack,
            });
            const backLinkWidth = doc.getTextWidth(backLinkText);

            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + backLinkWidth,
              currentY + 0.5
            );
          }
        }
        if (job.passportPhoto || job.passportPhotoBack) {
          currentY += 5;
          const frontLinkText = 'Front';
          const separatorText = ' | ';
          const backLinkText = 'Back';
          const passportPhoto = job?.passportPhoto || '#';
          const passportPhotoBack = job?.passportPhotoBack || '#';
          const prefixText = `Passport Photo: `;

          doc.setTextColor(100, 100, 100);
          doc.text(prefixText, margin, currentY);

          const prefixWidth = doc.getTextWidth(prefixText);
          let currentXPosition = margin + prefixWidth;
          doc.setTextColor(0, 0, 255);

          if (job.passportPhoto) {
            doc.textWithLink(frontLinkText, currentXPosition, currentY, {
              url: passportPhoto,
            });
            const frontLinkWidth = doc.getTextWidth(frontLinkText);

            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + frontLinkWidth,
              currentY + 0.5
            );

            currentXPosition += frontLinkWidth;
          }

          if (job.passportPhoto && job.passportPhotoBack) {
            doc.setTextColor(0, 0, 0);
            doc.text(separatorText, currentXPosition, currentY);
            const separatorWidth = doc.getTextWidth(separatorText);
            currentXPosition += separatorWidth;
          }

          if (job.passportPhotoBack) {
            doc.setTextColor(0, 0, 255);
            doc.textWithLink(backLinkText, currentXPosition, currentY, {
              url: passportPhotoBack,
            });
            const backLinkWidth = doc.getTextWidth(backLinkText);
            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + backLinkWidth,
              currentY + 0.5
            );
          }
        }
        currentY += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Personal Information', margin, currentY);
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, currentY + 2, 80, currentY + 2);
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        const personalInfo = [
          `Passport No: ${job?.passportNumber}`,
          `Passport Expiry Date: ${this.formatDate(job?.passportExpiryDate)}`,
          `ECR: ${job?.ecr ? 'Required' : 'Not Required'}`,
          `Height: ${job?.height}`,
          `Weight: ${job?.weight}`,
          `Gender: ${job?.gender}`,
          `Marital Status: ${job?.maritialStatus ? job?.maritialStatus : ''}`,
        ];
        personalInfo.forEach((info) => {
          checkPageHeight(currentY, 6);
          doc.text(info, margin, currentY);
          currentY += 6;
        });

        currentY += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Skills', margin, currentY);
        doc.line(margin, currentY + 2, 40, currentY + 2);
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        let currentX = margin;
        job.skill.forEach((skill: { name: string }, index: number) => {
          const skillText =
            index === job.skill.length - 1 ? skill.name : skill.name + ', ';
          const skillWidth = doc.getTextWidth(skillText);

          if (currentX + skillWidth > pageWidth - margin) {
            currentY += 6;
            currentX = margin;
          }

          doc.text(skillText, currentX, currentY);
          currentX += skillWidth;
        });

        currentY += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        let text = 'Languages Read & Write';
        doc.text(text, margin, currentY);
        doc.line(margin, currentY + 2, 83, currentY + 2);
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);

        currentX = margin;
        const languagesWrite = job.languagesWrite.join(', ');

        languagesWrite
          .split(', ')
          .forEach(
            (
              language: string | number,
              index: number,
              array: string | any[]
            ) => {
              const languageText =
                language + (index < array.length - 1 ? ', ' : '');
              const languageWidth = doc.getTextWidth(languageText);

              if (currentX + languageWidth > pageWidth - margin) {
                currentY += 6;
                currentX = margin;
              }

              doc.text(languageText, currentX, currentY);
              currentX += languageWidth;
            }
          );

        currentY += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Languages Speak', margin, currentY);
        doc.line(margin, currentY + 2, 65, currentY + 2);
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);

        currentX = margin;
        const languagesRead = job.languagesRead.join(', ');

        languagesRead
          .split(', ')
          .forEach(
            (
              language: string | number,
              index: number,
              array: string | any[]
            ) => {
              const languageText =
                language + (index < array.length - 1 ? ', ' : '');
              const languageWidth = doc.getTextWidth(languageText);

              if (currentX + languageWidth > pageWidth - margin) {
                currentY += 6;
                currentX = margin;
              }

              doc.text(languageText, currentX, currentY);
              currentX += languageWidth;
            }
          );

        currentY += 10;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Education', margin, currentY);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, currentY + 2, 55, currentY + 2);
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        const sortedEducation = job.education.sort(
          (
            a: { completedDate: string | number | Date },
            b: { completedDate: string | number | Date }
          ) => {
            const dateA = new Date(a.completedDate);
            const dateB = new Date(b.completedDate);
            return dateB.getTime() - dateA.getTime();
          }
        );

        sortedEducation.forEach(
          (
            edu: {
              institution: any;
              course: any;
              completedDate: any;
              certificate: any;
            },
            index: number
          ) => {
            checkPageHeight(currentY, 40);

            doc.setTextColor(0, 0, 0);
            doc.text(`Institution: ${edu.institution}`, margin, currentY + 5);
            doc.text(`Course: ${edu.course}`, margin, currentY + 10);
            doc.text(
              `Completed On: ${this.formatDate(edu.completedDate)}`,
              margin,
              currentY + 15
            );

            currentY += 20;

            if (edu.certificate) {
              const linkText = 'View Certificate';
              const resumeLink = edu?.certificate || '#';

              const prefixText = 'Certificate: ';
              doc.setTextColor(0, 0, 0);
              doc.text(prefixText, margin, currentY);

              const prefixWidth = doc.getTextWidth(prefixText);

              doc.setTextColor(0, 0, 255);
              doc.textWithLink(linkText, margin + prefixWidth, currentY, {
                url: resumeLink,
              });

              const linkWidth = doc.getTextWidth(linkText);
              doc.setDrawColor(0, 0, 255);
              doc.line(
                margin + prefixWidth,
                currentY + 0.5,
                margin + prefixWidth + linkWidth,
                currentY + 0.5
              );

              currentY += 18;

              doc.setTextColor(0, 0, 0); // Reset text color to default (black) for subsequent elements
              doc.setDrawColor(0, 0, 0); // Reset draw color to default (black) for subsequent elements
            }
          }
        );

        currentY += 10;
        if (job.workExperience && job.workExperience.length > 0) {
          const presentExperience = job.workExperience.filter(
            (experience: { endDate: any }) =>
              this.formatDate(experience.endDate) === '01-01-1900'
          );
          const pastExperience = job.workExperience.filter(
            (experience: { endDate: any }) =>
              this.formatDate(experience.endDate) !== '01-01-1900'
          );

          pastExperience.sort(
            (
              a: { endDate: string | number | Date },
              b: { endDate: string | number | Date }
            ) => {
              const dateA = new Date(a.endDate);
              const dateB = new Date(b.endDate);
              return dateB.getTime() - dateA.getTime();
            }
          );

          const sortedExperience = [...presentExperience, ...pastExperience];

          doc.setFontSize(16);
          doc.setTextColor(0, 0, 0);
          doc.text('Work Experience', margin, currentY);
          doc.setDrawColor(0, 0, 0);
          doc.line(margin, currentY + 2, 70, currentY + 2);
          currentY += 10;
          doc.setFontSize(12);
          doc.setTextColor(80, 80, 80);

          sortedExperience.forEach(
            (
              experience: {
                companyName: string | string[];
                designation: string | string[];
                startDate: any;
                endDate: any;
                certificate: any;
              },
              index: number
            ) => {
              checkPageHeight(currentY, 40);

              doc.setTextColor(0, 0, 0);

              const endDate = this.formatDate(experience.endDate);
              const isPresent = endDate === '01-01-1900';

              doc.text(
                `Company Name: ${experience.companyName}${
                  isPresent ? ' (Present)' : ''
                }`,
                margin,
                currentY + 5
              );
              doc.text(
                `Designation: ${experience.designation}`,
                margin,
                currentY + 10
              );
              doc.text(
                `Start Date: ${this.formatDate(experience.startDate)}`,
                margin,
                currentY + 15
              );

              // Only show end date if it's not "Present"
              if (!isPresent) {
                doc.text(`End Date: ${endDate}`, margin, currentY + 20);
                currentY += 25;
              } else {
                currentY += 20; // Adjust spacing for "Present" entries
              }

              if (experience.certificate) {
                const linkText = 'View Certificate';
                const certificateLink = experience?.certificate || '#';

                const prefixText = 'Certificate: ';
                doc.setTextColor(0, 0, 0);
                doc.text(prefixText, margin, currentY);

                const prefixWidth = doc.getTextWidth(prefixText);

                doc.setTextColor(0, 0, 255);
                doc.textWithLink(linkText, margin + prefixWidth, currentY, {
                  url: certificateLink,
                });

                const linkWidth = doc.getTextWidth(linkText);
                doc.setDrawColor(0, 0, 255);
                doc.line(
                  margin + prefixWidth,
                  currentY + 0.5,
                  margin + prefixWidth + linkWidth,
                  currentY + 0.5
                );

                currentY += 18;

                doc.setTextColor(0, 0, 0);
                doc.setDrawColor(0, 0, 0);
              }
            }
          );
        }

        const totalHeight = currentY + 20;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated By', pageWidth - 50, totalHeight + 10);
        doc.setFontSize(10);
        doc.addImage(
          'assets/img/yohire-logo.png',
          'PNG',
          pageWidth - 30,
          totalHeight + 5,
          20,
          7
        );

        resolve();
      };
    });

    function getBase64Image(img: any, quality: number) {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx: any = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', quality);
    }
  }

  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) {
      return false;
    }
    return true;
  }
  formatDate(dateString: any) {
    const dateParts = dateString.split('T')[0].split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    return `${day}-${month}-${year}`;
  }

  makePdf() {
    let pdf = new jsPDF();
    pdf.html(this.el.nativeElement, {
      callback: (pdf) => {
        pdf.save('sample.pdf');
      },
    });
  }
}

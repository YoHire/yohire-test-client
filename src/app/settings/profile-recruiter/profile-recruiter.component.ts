import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  FormArray,
  FormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { COUNTRIES, URL } from 'src/app/constants/constants';
import { ImageSnippet } from 'src/app/models/image-snippet';
import { Location } from '@angular/common';
import { RoleName } from 'src/app/models/roleName';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtAuthResponse } from 'src/app/models/jwtAuthResponse';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-profile-recruiter',
  templateUrl: './profile-recruiter.component.html',
  styleUrls: ['./profile-recruiter.component.scss'],
})
export class ProfileRecruiterComponent implements OnInit {
  uploadedImageUrls: any[] = [];
  value: number = 0;
  linkTypes: any;
  selectedLinkType: any;
  countryCodes = COUNTRIES;
  @ViewChild('callAPIDialog') callAPIDialog!: TemplateRef<any>;
  private currentUserSubject: BehaviorSubject<JwtAuthResponse> =
    new BehaviorSubject<any>('');
  public currentUser: Observable<any> = this.currentUserSubject.asObservable();
  reliabilityScore: string = '';
  valueColor: string = 'Gold';
  imageUrl = URL.IMAGE;
  bio: string = '';
  selectedFile: ImageSnippet | any;
  passwordForm!: FormGroup;
  data: any;
  userId: any;
  ra: string = '';
  email: string = '';
  mobile: string = '';
  address: string = '';
  country: string = '';
  postalCode: string = '';
  state: string = '';
  city: string = '';
  addForm!: FormGroup;
  isEdit: boolean = true;
  loginUser: string = '';
  show: boolean = false;
  uploadUrl: string = `${URL.UPLOAD}?type=company`;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    private router: Router,
    public pageLocation: Location,
    public dialog: MatDialog,
    public fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.linkTypes = [
      { label: 'X (Twitter)', value: 'X' },
      { label: 'Facebook', value: 'FACEBOOK' },
      { label: 'Instagram', value: 'INSTAGRAM' },
      { label: 'Website', value: 'WEBSITE' },
      { label: 'GitHub', value: 'GITHUB' },
      { label: 'LinkedIn', value: 'LINKEDIN' },
    ];
    this.createForm();
    this.passwordForm = this.fb.group({
      password: ['', Validators.required],
    });
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.userId = this.authService.currentUserValue.user.id;
    if (this.userId) {
      this.getUser();
      this.edit(null);
    }
    this.addMobileValidation();
  }

  addMobileValidation() {
    this.addForm.get('mobile')?.valueChanges.subscribe((mobile) => {
      if (mobile) {
        this.addForm.get('countryCode')?.setValidators(Validators.required);
      } else {
        this.addForm.get('countryCode')?.clearValidators();
      }
      this.addForm.get('countryCode')?.updateValueAndValidity();
    });
  }
  userData: any = this.authService.currentUserValue.user;

  private createForm() {
    this.addForm = this.fb.group({
      ra: ['', Validators.required],
      countryCode: [''],
      mobile: [''],
      address: [''],
      bio: [''],
      email: ['', [Validators.required, Validators.email]],
      socialLinks: this.fb.array([]),
    });
    this.socialLinks.valueChanges.subscribe(() => {
      this.addForm.markAsDirty();
    });
  }
  calculateReliabilityScore(): void {
    let score = 0;
    const criteria = [
      { value: this.ra, weight: 20 },
      { value: this.mobile, weight: 20 },
      { value: this.address, weight: 10 },
      { value: this.bio, weight: 10 },
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
    this.valueColor = this.getColorBasedOnScore(this.value);
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
  get socialLinks(): FormArray {
    return this.addForm.get('socialLinks') as FormArray;
  }

  addSocialLink(): void {
    const socialLinkGroup = this.fb.group({
      type: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
    });
    this.socialLinks.push(socialLinkGroup);
    this.calculateReliabilityScore();
  }

  removeSocialLink(index: number): void {
    this.socialLinks.removeAt(index);
    this.addForm.updateValueAndValidity();
    this.addForm.markAsDirty();
    this.calculateReliabilityScore();
  }
  private setSocialLinks(socialLinks: any[]) {
    const socialLinksFormArray = this.fb.array([]);
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

    this.addForm.setControl('socialLinks', socialLinksFormArray);
  }
  getColorBasedOnScore(score: number): string {
    if (score >= 80) {
      return 'Green';
    } else if (score >= 60) {
      return 'Orange';
    } else if (score >= 40) {
      return 'Yellow';
    } else {
      return 'Red';
    }
  }
  getUser() {
    this.generalService.startLoading();
    this.userService.getUser(this.userId).subscribe({
      next: (response: any) => {
        const { ra, mobile, email, image, address, bio, companyImages } =
          response.data;
        this.data = response.data;
        this.ra = ra;
        this.address = address;
        this.bio = bio;
        this.imageUrl = image;
        this.mobile = mobile;
        this.email = email;
        this.uploadedImageUrls = companyImages;
        this.edit(this.data);
        this.calculateReliabilityScore();
        this.generalService.loaded();
      },
    });
  }

  validateNumber(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }
  getAvailableLinkTypes(index: number): any[] {
    const selectedTypes = this.socialLinks.controls
      .map((control) => control.get('type')?.value)
      .filter((type) => type);

    return this.linkTypes.filter(
      (linkType: { value: any }) =>
        !selectedTypes.includes(linkType.value) ||
        this.socialLinks.at(index).get('type')?.value === linkType.value
    );
  }
  onSubmit() {
    const password = this.passwordForm.get('password')?.value;
    if (!password) {
      this.notificationService.showError('Please enter password', 'Failed');
      return;
    }
    this.authService.verifyPassword(this.userId, password).subscribe({
      next: (response) => {
        if (response) {
          this.dialog.closeAll();
          this.create();
        } else {
          this.notificationService.showError('Invalid Password', 'Failed');
        }
      },
    });
  }

  edit(data: any | null) {
    if (data) {
      this.addForm.patchValue({
        ra: data.ra || '',
        mobile: data.mobile || '',
        address: data.address || '',
        bio: data.bio || '',
        email: data.email || '',
        countryCode: data.countryCode || '',
      });
      this.setSocialLinks(data.socialLinks || []);
      this.calculateReliabilityScore();
    }
  }

  create() {
    if (this.selectedFile) {
      this.uploadImage();
    } else {
      this.updateRecruiterDetails();
    }
  }

  updateRecruiterDetails() {
    this.userService
      .updateRecruiter(this.userId, this.addForm.value)
      .subscribe({
        next: (data) => {
          if (
            this.isEdit &&
            data.data.email != localStorage.getItem('user_name')
          ) {
            localStorage.setItem('user_name', data.data.email);
            this.userData.name = data.data.email;
          }
          this.isEdit = false;
          this.notificationService.showSuccess('Success', data.message);
          this.router.navigate(['/settings/profile-recruiter-view']);
          this.generalService.loaded();
        },
      });
  }

  onUpload() {
    this.userService.getUser(this.userId).subscribe({
      next: (response: any) => {
        const { companyImages } = response.data;
        this.uploadedImageUrls = companyImages;
        this.calculateReliabilityScore();
        this.generalService.loaded();
      },
    });
  }

  uploadImage() {
    this.generalService.startLoading();
    this.userService.uploadImage(this.selectedFile.file).subscribe({
      next: (data: any) => {
        this.notificationService.showSuccess('Success', data.message);
        this.updateRecruiterDetails();
      },
    });
  }

  canAddLink(): boolean {
    return this.socialLinks.controls.every((control) => control.valid);
  }

  verify() {
    if (this.addForm.invalid) {
      this.notificationService.showError(
        'Please fill the mandatory fields',
        'Failed'
      );
      return;
    }
    if (this.addForm.dirty || this.selectedFile) {
      const dialogRef = this.dialog.open(this.callAPIDialog, {
        disableClose: false,
      });
      dialogRef.afterClosed().subscribe(() => {
        this.passwordForm.reset();
      });
    } else {
      this.router.navigate(['/settings/profile-recruiter-view']);
    }
  }

  processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new ImageSnippet(event.target.result, file);
    });

    reader.readAsDataURL(file);
  }

  togglePasswordVisibility() {
    this.show = !this.show;
  }
}

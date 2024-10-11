import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { COUNTRIES } from 'src/app/constants/constants';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import {
  mobileNumberValidator,
  passwordMatchValidator,
} from 'src/app/validators/custom-validators';

@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html',
})
export class AuthDialogComponent implements OnInit {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  searchQuery = '';
  loginForm!: FormGroup;
  searchResults: any[] = [];
  google: any;
  btnDisplay = true;
  submitted = false;
  addForm!: FormGroup;
  show: boolean = false;
  tnc = false;
  newPassword = '';
  isRegisterMode = false;
  @Output() signInSuccess = new EventEmitter<void>();
  countryCodes = COUNTRIES;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private socialService: SocialAuthService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    if (!this.authService.isLoggedIn()) {
      this.subscribeToAuthState();
    }
  }

  private subscribeToAuthState(): void {
    this.socialService.authState.subscribe({
      next: (user) => {
        if (user) {
          this.handleGoogleLogin(user.idToken);
        }
      },
    });
    this.btnDisplay = !this.authService.isLoggedIn();
  }

  private handleGoogleLogin(idToken: string): void {
    this.authService.signInWithGoogle(idToken).subscribe({
      next: (response: any) => {
        const currentUrl = this.router.url;
        this.authService
          .signin(
            response.data.email,
            response.data.password,
            'google',
            currentUrl
          )
          .subscribe({
            next: () => {
              this.closeDialog();
              this.signInSuccess.emit();
            },
          });
      },
    });
  }

  private initializeForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.addForm = this.fb.group(
      {
        ra: ['', Validators.required],
        countryCode: ['', Validators.required],
        mobile: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{1,15}$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d)(?=.*[!@#$%^&*]).{8,}$/
            ),
          ],
        ],
        cPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  create(): void {
    this.submitted = true;
    if (this.addForm.invalid) {
      this.notificationService.showError('Please fill all fields', 'Failed');
      return;
    }

    const { cPassword, ...user } = this.addForm.value;
    this.authService.recruiter(user).subscribe({
      next: (data: { message: any }) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.resetForm();
      },
    });
  }

  showDialog() {
    this.visible = true;
  }

  private resetForm(): void {
    this.isRegisterMode = false;
    this.addForm.reset();
    this.submitted = false;
    this.tnc = false;
    this.newPassword = '';
  }

  login(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.notificationService.showError(
        'Please check your credentials and try again.',
        'Invalid Form'
      );
      return;
    }
    const { email, password } = this.loginForm.value;
    const currentUrl = this.router.url;
    this.authService.signin(email, password, 'yohire', currentUrl).subscribe({
      next: () => {
        this.closeDialog();
        this.signInSuccess.emit();
      },
    });
  }

  signInWithFB(): void {
    this.socialService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }
  signInWithGoogle(): void {
    this.socialService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
  tncChecked() {
    this.tnc = !this.tnc;
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    if (this.isRegisterMode) {
      this.initializeForms();
    }
    this.submitted = false;
  }

  validateNumber(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  closeDialog() {
    this.visible = false;
    this.close.emit();
  }
}

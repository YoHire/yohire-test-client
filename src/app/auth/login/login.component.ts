import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import {
  mobileNumberValidator,
  passwordMatchValidator,
} from 'src/app/validators/custom-validators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted: boolean = false;
  addForm!: FormGroup;
  tnc: boolean = false;
  newPassword: string | any;
  show: boolean = false;
  show1: boolean = false;
  show2: boolean = false;

  onRedirect(store: string) {
    if (store === 'google') {
      window.location.href =
        'https://play.google.com/store/apps/details?id=com.yohiresoftwares.yohirejobs&pli=1';
    } else if (store === 'apple') {
      window.location.href =
        'https://apps.apple.com/in/app/yohire-jobs-overseas-jobs/id6503939907';
    }
  }
  togglePasswordVisibility(field: string) {
    if (field === 'show') {
      this.show = !this.show;
    } else if (field === 'show1') {
      this.show1 = !this.show1;
    } else if (field === 'show2') {
      this.show2 = !this.show2;
    }
  }
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  login() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.notificationService.showError(
        'Please check your credentials and try again.',
        'Invalid Form'
      );
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.signin(email, password).subscribe({
      next: (data) => {
        if ((data?.accessToken ?? '').length > 0) {
          if (
            this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
            this.authService.hasRole(RoleName.ROLE_ADMIN)
          ) {
            this.router.navigate(['/home/dashboard-admin']);
          } else if (this.authService.hasRole(RoleName.ROLE_RECRUITER)) {
            this.router.navigate(['/home/dashboard']);
          } else {
            this.notificationService.showError(
              'Please contact yoHire',
              'Unauthorized'
            );
            this.authService.signout();
          }
        }
      },
      error: (err) => {
        this.submitted = false;
        this.loginForm.reset();
      },
    });
  }
  createForm(): void {
    this.addForm = this.fb.group(
      {
        ra: ['', Validators.required],
        mobile: [
          '',
          [
            Validators.required,
            Validators.pattern('^[0-9]{10}$'),
            mobileNumberValidator(),
          ],
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

  validateNumber(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  tncChecked() {
    this.tnc = !this.tnc;
  }

  get form() {
    return this.addForm.controls;
  }
  create() {
    this.submitted = true;
    if (this.addForm.invalid) {
      this.notificationService.showError('Please fill all fields', 'Failed');
      return;
    }
    const { cPassword, ...data } = this.addForm.value;
    const user = data;
    this.authService.recruiter(user).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.router.navigate(['/auth/login']);
        this.addForm.reset();
        this.submitted = false;
        this.tnc = false;
        this.newPassword = '';
        this.show1 = false;
      },
    });
  }

  password(event: any) {
    this.newPassword = event.target.value;
  }

  toggleShow() {
    this.show = !this.show;
  }
}

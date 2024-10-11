import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { passwordMatchValidator } from 'src/app/validators/custom-validators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  email: string = '';
  validToken: boolean = true;
  showPassword: boolean = false;
  showCPassword: boolean = false;
  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.email = '';
    this.validToken = true;
    this.resetForm = this.formBuilder.group(
      {
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

    this.route.queryParams.subscribe((params) => {
      this.email = params['email'];
      const userId = params['userId'];
      const token = params['token'];
      this.validateToken(userId, token);
    });
  }

  validateToken(userId: string, token: string) {
    this.authService.validateToken(userId, token).subscribe({
      next: (data: any) => {
        this.generalService.loaded();
        this.email = data.resetPasswordEntry.recruiter.email;
        this.validToken = true;
      },
      error: (error) => {
        this.generalService.loaded();
        this.validToken = false;
      },
    });
  }
  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'cPassword') {
      this.showCPassword = !this.showCPassword;
    }
  }
  resetPassword() {
    if (this.resetForm.invalid) {
      this.notificationService.showError(
        'Failed',
        'Please fill out all fields.'
      );
      return;
    }
    const password = this.resetForm.get('password')?.value;
    const confirmPassword = this.resetForm.get('cPassword')?.value;
    if (password !== confirmPassword) {
      this.notificationService.showError('Failed', 'Password mismatch');
      return;
    }
    const reset = {
      email: this.email,
      token: this.route.snapshot.queryParams['token'],
      password: password,
    };
    this.authService.resetPassword(reset).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.generalService.loaded();
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.notificationService.showError(error, 'Failed');
        this.generalService.loaded();
        this.resetForm.reset();
      },
    });
  }
}

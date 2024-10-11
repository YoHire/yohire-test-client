import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  submitted!: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private _location: Location
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  back() {
    this._location.back();
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  forgotPasswordSubmit() {
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      this.notificationService.showError(
        'Failed',
        'Please fill email correctly'
      );
      return;
    }

    this.authService.forgotPassword(this.email?.value).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.back();
      },
    });
  }
}

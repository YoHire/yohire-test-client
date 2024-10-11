import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from 'src/app/models/apiResponse';
import { RoleName } from 'src/app/models/roleName';
import { UserResponse } from 'src/app/models/user-response';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-new-admin',
  templateUrl: './new-admin.component.html',
})
export class NewAdminComponent implements OnInit {
  addForm: UntypedFormGroup | any;
  userId: number = 0;
  user: any;
  isEdit: boolean = false;

  submitted: boolean = false;
  loginUser: string = '';

  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public userService: UserService,
    public generalService: GeneralService,
    private authService: AuthService,
    public notificationService: NotificationService,
    private _location: Location
  ) {}

  ngOnInit(): void {
    this.add();
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.activatedRoute.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId > 0) {
        this.isEdit = true;
        this.getUser(this.userId);
      }
    });
  }

  back() {
    this._location.back();
  }

  getUser(user: any) {
    this.generalService.startLoading();
    this.userService
      .getUser(user)
      .subscribe((response: ApiResponse<UserResponse>) => {
        this.user = response.data;
        this.edit(this.user);
        this.generalService.loaded();
      });
  }

  get form() {
    return this.addForm.controls;
  }

  edit(data: any) {
    this.addForm = new UntypedFormGroup(
      {
        username: new UntypedFormControl(data.username),
        password: new UntypedFormControl(),
        cPassword: new UntypedFormControl(),
        name: new UntypedFormControl(data.name, [Validators.required]),
        gender: new UntypedFormControl(data.gender),
        mobileNo: new UntypedFormControl(data.mobile, [Validators.required]),
        email: new UntypedFormControl(data.email, [
          Validators.required,
          Validators.email,
        ]),
      },
      { updateOn: 'change' }
    );
  }

  add() {
    this.addForm = new UntypedFormGroup(
      {
        username: new UntypedFormControl('', [Validators.required]),
        password: new UntypedFormControl('', [Validators.required]),
        cPassword: new UntypedFormControl('', [Validators.required]),
        name: new UntypedFormControl('', [Validators.required]),
        gender: new UntypedFormControl('MALE'),
        mobileNo: new UntypedFormControl('', [Validators.required]),
        email: new UntypedFormControl('', [
          Validators.required,
          Validators.email,
        ]),
      },
      { updateOn: 'change' }
    );
  }

  create(user: any) {
    this.submitted = true;

    if (this.addForm.invalid) {
      this.notificationService.showError('Please fill all fields', 'Failed');
      return;
    }

    if (user.password != user.cPassword) {
      this.notificationService.showError('Passwords must be same', 'Failed');
      return;
    }

    this.generalService.startLoading();
    if (this.isEdit) {
      this.userService.updateAdmin(this.userId, user).subscribe({
        next: (data) => {
          this.generalService.loaded();
          this.notificationService.showSuccess(data.message, 'Success');
          this.back();
        },
        error: (error) => {
          this.generalService.loaded();
          this.notificationService.showError(error, 'Failed');
        },
      });
    } else {
      const { username, password, name, gender, mobileNo, email } = user;
      const mobile = parseInt(mobileNo);
      this.userService
        .createAdmin({ username, password, name, gender, mobile, email })
        .subscribe({
          next: (data) => {
            this.generalService.loaded();
            this.notificationService.showSuccess(data.message, 'Success');
            this.back();
          },
          error: (error) => {
            this.generalService.loaded();
            this.notificationService.showError(error, 'Failed');
          },
        });
    }
  }
}

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user';
import { UserDataResponse } from 'src/app/models/userDataResponse';
import { UserResponse } from 'src/app/models/user-response';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { RoleName } from 'src/app/models/roleName';

@Component({
  selector: 'app-update-recruiter',
  templateUrl: './update-recruiter.component.html',
})
export class UpdateRecruiterComponent implements OnInit {
  userId: number = 0;
  data: User | any;
  addForm: UntypedFormGroup | any;
  licenceNo: string = '';
  additionalContactNo: string = '';
  loginUser: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    public pageLocation: Location
  ) {}

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.add();

    this.activatedRoute.params.subscribe((params) => {
      this.userId = params['id'];

      this.getUser(this.userId);
    });
  }

  getUser(id: any) {
    this.generalService.startLoading();
    this.userService.getUser(id).subscribe((items: any) => {
      this.data = items.data;
      this.edit(this.data);
      this.generalService.loaded();
    });
  }

  back() {
    this.pageLocation.back();
  }

  add() {
    this.addForm = new UntypedFormGroup(
      {
        ra: new UntypedFormControl('', [Validators.required]),
        mobile: new UntypedFormControl(),
        raid: new UntypedFormControl(),
        email: new UntypedFormControl(),
        authSignEmail: new UntypedFormControl(),
        authSignPhone: new UntypedFormControl(),
        licenseNo: new UntypedFormControl(),
        gstNo: new UntypedFormControl(),
      },
      { updateOn: 'change' }
    );
  }

  edit(data: any) {
    this.addForm = new UntypedFormGroup(
      {
        ra: new UntypedFormControl(data.ra, Validators.required),
        mobile: new UntypedFormControl(data.mobile, Validators.required),
        raid: new UntypedFormControl(data.kyc.raid, Validators.required),
        email: new UntypedFormControl(data.email, [
          Validators.required,
          Validators.email,
        ]),
        authSignEmail: new UntypedFormControl(
          data.kyc.authSignEmail,
          Validators.required
        ),
        authSignPhone: new UntypedFormControl(
          data.kyc.authSignPhone,
          Validators.required
        ),
        licenseNo: new UntypedFormControl(
          data.kyc.licenseNo,
          Validators.required
        ),
        gstNo: new UntypedFormControl(data.kyc.gstNo, Validators.required),
      },
      { updateOn: 'change' }
    );
  }

  create(user: any) {
    if (this.addForm.invalid) {
      this.notificationService.showError('Please fill all fields', 'Failed');
      return;
    }

    this.userService.updateRecruiter(this.userId, user).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.generalService.loaded();
        this.back();
      },
      error: (error) => {
        this.notificationService.showError(error.message, 'Failed');
        this.generalService.loaded();
      },
    });
  }
}

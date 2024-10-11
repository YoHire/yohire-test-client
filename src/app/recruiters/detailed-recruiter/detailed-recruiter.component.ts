import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from 'src/app/models/apiResponse';
import { UserDataResponse } from 'src/app/models/userDataResponse';
import { UserResponse } from 'src/app/models/user-response';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { RoleName } from 'src/app/models/roleName';

@Component({
  selector: 'app-detailed-recruiter',
  templateUrl: './detailed-recruiter.component.html',
})
export class DetailedRecruiterComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    public pageLocation: Location
  ) {}

  data: UserResponse | any;
  userId: any;
  licenceNo: string = '';
  addContactNo: string = '';
  loginUser: string = '';
  email:string = ''

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.activatedRoute.params.subscribe((params) => {
      this.userId = params['id'];
      this.getUser(this.userId);
    });
  }

  getUser(id: any) {
    this.generalService.startLoading();
    this.userService
      .getUser(id)
      .subscribe((items: ApiResponse<UserResponse>) => {
        this.data = items.data;
        this.generalService.loaded();
      });
  }

  back() {
    this.pageLocation.back();
  }

  verify(id: any) {
    this.generalService.startLoading();
    this.userService.verificationUser(id).subscribe({
      next: (data) => {
        this.notificationService.showSuccess('Success', data.message);
        this.getUser(this.userId);
        this.generalService.loaded();
      },
      error: (error) => {
        this.notificationService.showError('Failed', error.message);
        this.generalService.loaded();
      },
    });
  }

  delete(id: any) {
    this.generalService.startLoading();
    this.userService.delete(id).subscribe({
      next: (data) => {
        this.notificationService.showSuccess('Success', data.message);
        this.back();
        this.generalService.loaded();
      },
      error: (error) => {
        this.notificationService.showError('Failed', error.message);
        this.generalService.loaded();
      },
    });
  }
}

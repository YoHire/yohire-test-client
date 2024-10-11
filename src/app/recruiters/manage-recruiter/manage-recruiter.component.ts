import { Component, OnInit } from '@angular/core';
import { RoleName } from 'src/app/models/roleName';
import { UserDataResponse } from 'src/app/models/userDataResponse';
import { UserResponse } from 'src/app/models/user-response';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-manage-recruiter',
  templateUrl: './manage-recruiter.component.html',
})
export class ManageRecruiterComponent implements OnInit {
  data!: any;
  selectedId!: string;
  suspendLabel!: string;
  stateOptions: any[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Verified', value: 'verified' },
  ];
  isToggled: boolean = false;
  value: string = 'off';

  items: UserResponse[] = [];
  itemsFiltered: any;

  pageCount: number = 0;
  page: number = 0;
  size: number = 20;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  verified: any = 1;
  status: any = 2;
  catId: number = 0;

  sortedColumn = 'name';
  sortedDirection = 'asc';
  loginUser: string = '';
  trackByItemId = trackByItemId;
  constructor(
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
    this.list();

    this.data = [
      // {
      //   label: '',

      //   command: () => {
      //     const newStatus =
      //       this.data[0].label === 'Revoke' ? 'ACTIVE' : 'INACTIVE';

      //     this.suspend(this.selectedId, newStatus);
      //   },
      // },
      {
        label: 'Delete',
        command: () => {
          this.delete(this.selectedId);
        },
      },
    ];
  }

  list() {
    this.generalService.startLoading();
    let verifiedValue = this.verified;
    let statusValue = this.status;

    if (this.verified == 2) verifiedValue = null;
    if (this.status == 2) statusValue = null;

    this.userService.listRecruiters().subscribe({
      next: (items: any) => {
        this.items = items.data;
        this.itemsFiltered = [...this.items];
        const firstItemStatus = this.itemsFiltered[0].status;
        this.data[0].label =
          firstItemStatus === 'ACTIVE' ? 'Suspend' : 'Revoke';
        this.paginateItems();
        this.generalService.loaded();
      },
    });
  }

  updateVerification(kycId: string) {
    this.userService.updateKycVerification(kycId).subscribe({
      next: () => {
        this.list();
        this.generalService.loaded();
      },
    });
  }

  suspend(id: string, status: any) {
    this.generalService.startLoading();
    this.userService.recruiterStatusUpdate(id, status).subscribe({
      next: (data) => {
        this.notificationService.showSuccess('Success', data.message);
        this.list();
        this.generalService.loaded();
      },
      error: (error) => {
        this.notificationService.showError('Failed', error.message);
        this.generalService.loaded();
      },
    });
  }

  customFilter(event: any) {
    const val = event.target.value.toLowerCase();

    const temp = this.items.filter(function (d: any) {
      let filter1 = d.name.toLowerCase().indexOf(val) !== -1;
      let filter2 = d.email.toLowerCase().indexOf(val) !== -1;
      let filter3 = d.mobile.toLowerCase().indexOf(val) !== -1;
      let filter4 = d.city ? d.city.toLowerCase().indexOf(val) !== -1 : '';
      let filter5 = d.state ? d.state.toLowerCase().indexOf(val) !== -1 : '';

      let filter6 = d.userData.filter(
        (item: UserDataResponse) => item.item === 'LICENCE_NO'
      )[0]
        ? d.userData
            .filter((item: UserDataResponse) => item.item === 'LICENCE_NO')[0]
            .value.toLowerCase()
            .indexOf(val) !== -1
        : '';

      return (
        filter1 || filter2 || filter3 || filter4 || filter5 || filter6 || !val
      );
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

  getLicense(userData: any) {
    return userData.filter(
      (item: UserDataResponse) => item.item === 'LICENCE_NO'
    )[0]
      ? userData.filter(
          (item: UserDataResponse) => item.item === 'LICENCE_NO'
        )[0].value
      : '';
  }

  delete(id: any) {
    this.generalService.startLoading();
    this.userService.delete(id).subscribe({
      next: (data) => {
        this.notificationService.showSuccess('Success', data.message);
        this.list();
        this.generalService.loaded();
      },
      error: (error) => {
        this.notificationService.showError('Failed', error.message);
        this.generalService.loaded();
      },
    });
  }

  verify(id: any) {
    this.generalService.startLoading();
    this.userService.verificationUser(id).subscribe({
      next: (data) => {
        this.notificationService.showSuccess('Success', data.message);
        this.list();
        this.generalService.loaded();
      },
      error: (error) => {
        this.notificationService.showError('Failed', error.message);
        this.generalService.loaded();
      },
    });
  }

  statusUpdate(id: string, status: any) {
    this.generalService.startLoading();
    this.userService.statusUpdate(id, status).subscribe({
      next: (data) => {
        this.notificationService.showSuccess('Success', data.message);
        this.list();
        this.generalService.loaded();
      },
      error: (error) => {
        this.notificationService.showError('Failed', error.message);
        this.generalService.loaded();
      },
    });
  }
  selectJob(id: string) {
    this.selectedId = id;
  }
}

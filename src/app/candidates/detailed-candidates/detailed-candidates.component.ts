import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from 'src/app/models/apiResponse';
import { UserDataResponse } from 'src/app/models/userDataResponse';
import { UserResponse } from 'src/app/models/user-response';
import { GeneralService } from 'src/app/services/general.service';
import { UserService } from 'src/app/services/user.service';
import { URL } from 'src/app/constants/constants';

@Component({
  selector: 'app-detailed-candidates',
  templateUrl: './detailed-candidates.component.html',
})
export class DetailedCandidatesComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private generalService: GeneralService,
    public pageLocation: Location
  ) {}

  data: UserResponse | any;
  userId: any;
  licenceNo: string = '';
  addContactNo: string = '';
  imageUrl = URL.IMAGE;

  ngOnInit(): void {
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

        this.licenceNo = this.data.userData.filter(
          (item: UserDataResponse) => item.item === 'LICENCE_NO'
        )[0]
          ? this.data.userData.filter(
              (item: UserDataResponse) => item.item === 'LICENCE_NO'
            )[0].value
          : '';
        this.addContactNo = this.data.userData.filter(
          (item: UserDataResponse) => item.item === 'ADDITIONAL_CONTACT_NO'
        )[0]
          ? this.data.userData.filter(
              (item: UserDataResponse) => item.item === 'ADDITIONAL_CONTACT_NO'
            )[0].value
          : '';

        this.generalService.loaded();
      });
  }

  back() {
    this.pageLocation.back();
  }
}

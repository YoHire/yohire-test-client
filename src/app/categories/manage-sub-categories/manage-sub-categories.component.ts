import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from 'src/app/models/apiResponse';
import { CategoryResponse } from 'src/app/models/categoryResponse';
import { RoleName } from 'src/app/models/roleName';
import { SubCategoryResponse } from 'src/app/models/subCategoryResponse';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { GeneralService } from 'src/app/services/general.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-manage-sub-categories',
  templateUrl: './manage-sub-categories.component.html',
})
export class ManageSubCategoriesComponent implements OnInit {
  constructor(
    private categoryService: CategoryService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private generalService: GeneralService,
    public pageLocation: Location
  ) {}

  items: SubCategoryResponse[] = [];
  itemsFiltered: SubCategoryResponse[] = [];

  pageCount: number = 0;
  page: number = 0;
  size: number = 20;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  sortedColumn = 'name';
  sortedDirection = 'asc';

  status: string = 'active';
  catId: any = 0;
  catName: any = '';
  loginUser: string = '';
  trackByItemId = trackByItemId;

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';

    this.activatedRoute.params.subscribe((params) => {
      this.catId = params['catId'];
      if (this.catId != 0) {
        // this.list();
        this.getCategory(this.catId);
      }
    });
  }

  getCategory(id: any) {
    this.generalService.startLoading();
    this.categoryService
      .fetch(id)
      .subscribe((response: ApiResponse<CategoryResponse>) => {
        this.catName = response.data.name;
        this.generalService.loaded();
      });
  }

  // list() {
  //   this.generalService.startLoading();

  //   this.categoryService.listSubCategory(this.catId, this.status).subscribe({
  //     next: (items: SubCategoryResponse[]) => {
  //       this.items = items;
  //       this.itemsFiltered = [...this.items];
  //       this.paginateItems();
  //       this.generalService.loaded();
  //     },
  //     error: (error: string) => {
  //       this.notificationService.showError(error, 'Failed')
  //       this.generalService.loaded();
  //     }
  //   });
  // }

  customFilter(event: any) {
    const val = event.target.value.toLowerCase();

    const temp = this.items.filter(function (d: any) {
      let filter1 = d.name.toLowerCase().indexOf(val) !== -1;

      return filter1 || !val;
    });

    // update the rows
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

  back() {
    this.pageLocation.back();
  }

  // delete(id: any) {
  //   this.generalService.startLoading();
  //   this.categoryService.deleteSubCategory(this.catId, id).subscribe(
  //     data => {
  //       this.notificationService.showSuccess(data.message, 'Success')
  //       this.list();
  //       this.generalService.loaded();
  //     },
  //     error => {
  //       this.notificationService.showError(error.message, 'Failed')
  //       this.generalService.loaded();
  //     });
  // }

  // statusUpdate(id: any, status: any) {
  //   this.generalService.startLoading();
  //   this.categoryService.statusUpdateSubCategory(this.catId, id, status).subscribe(
  //     data => {
  //       this.notificationService.showSuccess(data.message, 'Success')
  //       this.list();
  //       this.generalService.loaded();
  //     },
  //     error => {
  //       this.notificationService.showError(error.message, 'Failed')
  //       this.generalService.loaded();
  //     });
  // }
}

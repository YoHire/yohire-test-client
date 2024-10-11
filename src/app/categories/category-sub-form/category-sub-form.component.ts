import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { SubCategoryResponse } from 'src/app/models/subCategoryResponse';

@Component({
  selector: 'app-category-sub-form',
  templateUrl: './category-sub-form.component.html',
})
export class CategorySubFormComponent implements OnInit {
  @ViewChild('closeBtn') public closeBtn: ElementRef | undefined;
  @Input() categoryId: number = 0;
  @Input() categoryName: string = '';

  subCategory: SubCategoryResponse = new SubCategoryResponse(0, '', '');

  @Output() outputEvent = new EventEmitter<SubCategoryResponse>();

  ngOnInit(): void {}

  edit(subCategory: SubCategoryResponse) {
    this.subCategory = subCategory;
  }

  sendOutput(data: SubCategoryResponse) {
    this.subCategory = new SubCategoryResponse(0, '', '');
    this.closeBtn?.nativeElement.click();
    this.outputEvent.emit(data);
  }

  // save() {

  //   if (this.subCategory.name == '') {
  //     this.notificationService.showError("Please enter the sub category name", "Failed");
  //     return;
  //   }

  //   if (this.subCategory.id > 0) {
  //     this.categoryService.updateSubCategory(this.categoryId, this.subCategory.id, this.subCategory.name).subscribe(
  //       data => {
  //         this.notificationService.showSuccess(data.message, 'Success')
  //         this.generalService.loaded();
  //         this.sendOutput(data.data);
  //       },
  //       error => {
  //         this.notificationService.showError(error, 'Failed')
  //         this.generalService.loaded();
  //       }
  //     );
  //   } else {
  //     this.categoryService.createSubCategory(this.categoryId, this.subCategory.name).subscribe(
  //       data => {
  //         this.notificationService.showSuccess(data.message, 'Success')
  //         this.generalService.loaded();
  //         this.sendOutput(data.data);
  //       },
  //       error => {
  //         this.notificationService.showError(error, 'Failed')
  //         this.generalService.loaded();
  //       }
  //     );
  //   }
  // }
}

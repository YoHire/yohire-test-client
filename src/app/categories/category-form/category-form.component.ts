import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CategoryResponse } from 'src/app/models/categoryResponse';
import { CategoryService } from 'src/app/services/category.service';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  @ViewChild('closeBtn') public closeBtn: ElementRef | undefined;

  constructor(
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private generalService: GeneralService
  ) {}

  category: CategoryResponse = new CategoryResponse(0, '', '', '', '');

  @Output() outputEvent = new EventEmitter<CategoryResponse>();

  ngOnInit(): void {}

  edit(category: CategoryResponse) {
    this.category = category;
  }

  sendOutput(data: CategoryResponse) {
    this.category = new CategoryResponse(0, '', '', '', '');
    this.closeBtn?.nativeElement.click();
    this.outputEvent.emit(data);
  }

  save() {
    if (this.category.name == '') {
      this.notificationService.showError(
        'Please enter the category name',
        'Failed'
      );
      return;
    }

    if (this.category.id > 0) {
      this.categoryService
        .update(
          this.category.id,
          this.category.name,
          this.category.tags,
          this.category.filterTags
        )
        .subscribe({
          next: (data) => {
            this.notificationService.showSuccess(data.message, 'Success');
            this.generalService.loaded();
            this.sendOutput(data.data);
          },
          error: (error) => {
            this.notificationService.showError(error, 'Failed');
            this.generalService.loaded();
          },
        });
    } else {
      this.categoryService
        .create(
          this.category.name,
          this.category.tags,
          this.category.filterTags
        )
        .subscribe({
          next: (data) => {
            this.notificationService.showSuccess(data.message, 'Success');
            this.generalService.loaded();
            this.sendOutput(data.data);
          },
          error: (error) => {
            this.notificationService.showError(error, 'Failed');
            this.generalService.loaded();
          },
        });
    }
  }
}

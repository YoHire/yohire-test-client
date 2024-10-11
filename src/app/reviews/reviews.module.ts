import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReviewsListComponent } from './reviews-list/reviews-list.component';
import { ReviewsRoutingModule } from './reviews-routing.module';
import { ReviewsViewComponent } from './reviews-view/reviews-view.component';

@NgModule({
  declarations: [ReviewsListComponent, ReviewsViewComponent],
  imports: [CommonModule, ReviewsRoutingModule],
})
export class ReviewsModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReviewsListComponent } from './reviews-list/reviews-list.component';
import { ReviewsViewComponent } from './reviews-view/reviews-view.component';

const routes: Routes = [
  { path: 'list', component: ReviewsListComponent },
  { path: 'view/:id', component: ReviewsViewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReviewsRoutingModule {}

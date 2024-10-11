import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobsRequestsListComponent } from './jobs-requests-list/jobs-requests-list.component';
import { JobsRequestsViewComponent } from './jobs-requests-view/jobs-requests-view.component';

const routes: Routes = [
  { path: 'list', component: JobsRequestsListComponent },
  { path: 'view/:id', component: JobsRequestsViewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobsRequestsRoutingModule {}

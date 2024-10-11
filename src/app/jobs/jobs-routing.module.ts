import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpiredListComponent } from './expired-list/expired-list.component';
import { JobsListAdminComponent } from './jobs-list-admin/jobs-list-admin.component';
import { JobsListRecruiterComponent } from './jobs-list-recruiter/jobs-list-recruiter.component';
import { JobsViewComponent } from './jobs-view/jobs-view.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { AddJobComponent } from './add-job/add-job.component';

const routes: Routes = [
  { path: 'admin/list', component: JobsListAdminComponent },
  { path: 'recruiter/list', component: JobsListRecruiterComponent },
  { path: 'expired/list', component: ExpiredListComponent },
  { path: 'transactions/list', component: TransactionsComponent },
  { path: 'add', component: AddJobComponent },
  { path: 'edit/:id', component: AddJobComponent },
  { path: 'view/:id', component: JobsViewComponent },
  {
    path: 'requests/:jobId',
    loadChildren: () =>
      import('./jobs-requests/jobs-requests.module').then(
        (m) => m.JobsRequestsModule
      ),
  },
  { path: 'transactions', redirectTo: 'transactions/list', pathMatch: 'full' },
  { path: '', redirectTo: 'recruiter/list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobsRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailedRecruiterComponent } from './detailed-recruiter/detailed-recruiter.component';
import { ManageRecruiterComponent } from './manage-recruiter/manage-recruiter.component';
import { UpdateRecruiterComponent } from './update-recruiter/update-recruiter.component';

const routes: Routes = [
  { path: 'manage', component: ManageRecruiterComponent },
  { path: 'update/:id', component: UpdateRecruiterComponent },
  { path: 'detailed/:id', component: DetailedRecruiterComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecruitersRoutingModule {}

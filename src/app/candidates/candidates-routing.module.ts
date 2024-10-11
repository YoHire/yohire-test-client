import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailedCandidatesComponent } from './detailed-candidates/detailed-candidates.component';
import { ManageCandidatesComponent } from './manage-candidates/manage-candidates.component';
import { PaidCandidatesDetailedComponent } from './paid-candidates-detailed/paid-candidates-detailed.component';
import { PaidCandidatesListComponent } from './paid-candidates-list/paid-candidates-list.component';

const routes: Routes = [
  { path: 'manage', component: ManageCandidatesComponent },
  { path: 'detailed/:id', component: DetailedCandidatesComponent },
  { path: 'paid-candidates-list', component: PaidCandidatesListComponent },
  {
    path: 'paid-candidates-detailed',
    component: PaidCandidatesDetailedComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidatesRoutingModule {}

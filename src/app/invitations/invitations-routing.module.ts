import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoldersListComponent } from './folders-list/folders-list.component';
import { InvitedQueueDetailsComponent } from './invited-queue-details/invited-queue-details.component';

const routes: Routes = [
  { path: '', component: FoldersListComponent },
  { path: 'details/:id', component: InvitedQueueDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvitationsRoutingModule {}

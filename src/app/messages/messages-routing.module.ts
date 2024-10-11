import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageMessageComponent } from './manage-message/manage-message.component';

const routes: Routes = [
  { path: 'message-list', component: ManageMessageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagesRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminListComponent } from './admin-list/admin-list.component';
import { NewAdminComponent } from './new-admin/new-admin.component';

const routes: Routes = [
  { path: 'admin-list', component: AdminListComponent },
  { path: 'new-admin/:id', component: NewAdminComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}

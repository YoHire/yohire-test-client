import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageSettingsComponent } from './manage-settings/manage-settings.component';
import { ProfileAdminComponent } from './profile-admin/profile-admin.component';
import { ProfileRecruiterViewComponent } from './profile-recruiter-view/profile-recruiter-view.component';
import { ProfileRecruiterComponent } from './profile-recruiter/profile-recruiter.component';
import { UpdateSettingsComponent } from './update-settings/update-settings.component';

const routes: Routes = [
  { path: 'manage', component: ManageSettingsComponent },
  { path: 'update', component: UpdateSettingsComponent },
  { path: 'profile-admin', component: ProfileAdminComponent },
  { path: 'profile-recruiter', component: ProfileRecruiterComponent },
  { path: 'profile-recruiter-view', component: ProfileRecruiterViewComponent },
  { path: '', redirectTo: 'profile-recruiter-view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}

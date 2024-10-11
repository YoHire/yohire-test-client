import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { ManageSettingsComponent } from './manage-settings/manage-settings.component';
import { UpdateSettingsComponent } from './update-settings/update-settings.component';
import { ProfileAdminComponent } from './profile-admin/profile-admin.component';
import { ProfileRecruiterComponent } from './profile-recruiter/profile-recruiter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileRecruiterViewComponent } from './profile-recruiter-view/profile-recruiter-view.component';
import { DirectivesModule } from '../directives/directives.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { KnobModule } from 'primeng/knob';
import { GalleriaModule } from 'primeng/galleria';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  declarations: [
    ManageSettingsComponent,
    UpdateSettingsComponent,
    ProfileAdminComponent,
    ProfileRecruiterComponent,
    ProfileRecruiterViewComponent,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DirectivesModule,
    CommonModule,
    MatDialogModule,
    ProgressBarModule,
    KnobModule,
    GalleriaModule,
    FileUploadModule,
    TooltipModule,
    InputTextareaModule,
    DropdownModule,
    InputTextModule
  ],
})
export class SettingsModule {}

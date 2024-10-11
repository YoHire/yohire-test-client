import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMyDatePickerModule } from 'angular-mydatepicker-ivy';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { GeneralModule } from '../general/general.module';
import { PipesModule } from '../pipes/pipes.module';
import { JobsListAdminComponent } from './jobs-list-admin/jobs-list-admin.component';
import { JobsListRecruiterComponent } from './jobs-list-recruiter/jobs-list-recruiter.component';
import { JobsRoutingModule } from './jobs-routing.module';
import { JobsViewComponent } from './jobs-view/jobs-view.component';
import { ExpiredListComponent } from './expired-list/expired-list.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { JobsTabListComponent } from './jobs-tab-list/jobs-tab-list.component';
import { JobsTabListAdminComponent } from './jobs-tab-list-admin/jobs-tab-list-admin.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DirectivesModule } from '../directives/directives.module';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { AddJobComponent } from './add-job/add-job.component';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SplitterModule } from 'primeng/splitter';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollTopModule } from 'primeng/scrolltop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DropdownModule } from 'primeng/dropdown';
import { TreeSelectModule } from 'primeng/treeselect';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { InputGroupModule } from 'primeng/inputgroup';
import { CalendarModule } from 'primeng/calendar'
import { FloatLabelModule } from 'primeng/floatlabel';


@NgModule({
  declarations: [
    JobsListAdminComponent,
    AddJobComponent,
    JobsListRecruiterComponent,
    JobsViewComponent,
    ExpiredListComponent,
    TransactionsComponent,
    JobsTabListComponent,
    JobsTabListAdminComponent,
  ],
  imports: [
    CommonModule,
    JobsRoutingModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralModule,
    MatDialogModule,
    AngularMyDatePickerModule,
    ButtonModule,
    AutocompleteLibModule,
    NgMultiSelectDropDownModule,
    DirectivesModule,
    MatButtonToggleModule,
    MatSliderModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    InputGroupModule,
    MatInputModule,
    MatSelectModule,
    DropdownModule,
    TreeSelectModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatMenuModule,
    StepperModule,
    StepperModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToggleButtonModule,
    SplitterModule,
    ProgressSpinnerModule,
    ScrollTopModule,
    MatTooltipModule,
    CheckboxModule,
    DialogModule,
    FileUploadModule,
    BadgeModule,
    ProgressBarModule,
    ToastModule,
    SplitButtonModule,
    CascadeSelectModule,
    CalendarModule,
    FloatLabelModule
  ],
})
export class JobsModule {}

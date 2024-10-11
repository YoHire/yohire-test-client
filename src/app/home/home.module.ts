import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { ScreenTimeComponent } from './screen-time/screen-time.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ChartModule } from 'primeng/chart';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { StepperModule } from 'primeng/stepper';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
@NgModule({
  declarations: [
    DashboardComponent,
    DashboardAdminComponent,
    ScreenTimeComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    ChartModule,
    ReactiveFormsModule,
    TooltipModule,
    CardModule,
    NgApexchartsModule,
    TableModule,
    TagModule,
    RatingModule,
    ButtonModule,
    SkeletonModule,
    DialogModule,
    StepperModule,
    DropdownModule,
    FileUploadModule,
    ProgressBarModule
  ],
})
export class HomeModule {}

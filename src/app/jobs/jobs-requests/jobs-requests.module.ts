import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobsRequestsRoutingModule } from './jobs-requests-routing.module';
import { JobsRequestsListComponent } from './jobs-requests-list/jobs-requests-list.component';
import { JobsRequestsViewComponent } from './jobs-requests-view/jobs-requests-view.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GeneralModule } from 'src/app/general/general.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [JobsRequestsListComponent, JobsRequestsViewComponent],
  imports: [
    CommonModule,
    JobsRequestsRoutingModule,
    MatDialogModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralModule,
    MatTabsModule,
    ProgressBarModule,
    TooltipModule,
    BadgeModule,
    ButtonModule,
  ],
})
export class JobsRequestsModule {}

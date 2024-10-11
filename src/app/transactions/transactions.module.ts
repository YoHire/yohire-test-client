import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { DetailsComponent } from './details/details.component';
import { PipesModule } from '../pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { GeneralModule } from '../general/general.module';
import { JobsRoutingModule } from '../jobs/jobs-routing.module';

@NgModule({
  declarations: [DetailsComponent],
  imports: [CommonModule, TransactionsRoutingModule, PipesModule,   CommonModule,
    JobsRoutingModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralModule,
    MatDialogModule,],
})
export class TransactionsModule {}

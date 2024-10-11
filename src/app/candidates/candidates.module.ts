import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidatesRoutingModule } from './candidates-routing.module';
import { ManageCandidatesComponent } from './manage-candidates/manage-candidates.component';
import { DetailedCandidatesComponent } from './detailed-candidates/detailed-candidates.component';
import { PaidCandidatesListComponent } from './paid-candidates-list/paid-candidates-list.component';
import { PaidCandidatesDetailedComponent } from './paid-candidates-detailed/paid-candidates-detailed.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [
    ManageCandidatesComponent,
    DetailedCandidatesComponent,
    PaidCandidatesListComponent,
    PaidCandidatesDetailedComponent,
  ],
  imports: [
    CommonModule,
    CandidatesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
  ],
})
export class CandidatesModule {}

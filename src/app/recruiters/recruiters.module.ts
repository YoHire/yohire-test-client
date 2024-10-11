import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecruitersRoutingModule } from './recruiters-routing.module';
import { ManageRecruiterComponent } from './manage-recruiter/manage-recruiter.component';
import { UpdateRecruiterComponent } from './update-recruiter/update-recruiter.component';
import { DetailedRecruiterComponent } from './detailed-recruiter/detailed-recruiter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { SplitButtonModule } from 'primeng/splitbutton';
import { PipesModule } from '../pipes/pipes.module';


@NgModule({
  declarations: [
    ManageRecruiterComponent,
    UpdateRecruiterComponent,
    DetailedRecruiterComponent,
  ],
  imports: [
    CommonModule,
    RecruitersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SelectButtonModule,
    PipesModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    MultiSelectModule,
    DropdownModule,
    ToggleButtonModule,
    MatSlideToggleModule,
    SplitButtonModule,
  ],
})
export class RecruitersModule {}

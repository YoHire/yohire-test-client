import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminListComponent } from './admin-list/admin-list.component';
import { NewAdminComponent } from './new-admin/new-admin.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';
import { GeneralModule } from '../general/general.module';
import { DirectivesModule } from '../directives/directives.module';

@NgModule({
  declarations: [AdminListComponent, NewAdminComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    GeneralModule,
    DirectivesModule,
  ],
})
export class AdminModule {}

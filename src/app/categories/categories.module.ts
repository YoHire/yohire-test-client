import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';
import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoryFormComponent } from './category-form/category-form.component';
import { CategorySubFormComponent } from './category-sub-form/category-sub-form.component';
import { ManageCategoriesComponent } from './manage-categories/manage-categories.component';
import { ManageSubCategoriesComponent } from './manage-sub-categories/manage-sub-categories.component';

@NgModule({
  declarations: [
    ManageCategoriesComponent,
    ManageSubCategoriesComponent,
    CategoryFormComponent,
    CategorySubFormComponent,
  ],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
  ],
})
export class CategoriesModule {}

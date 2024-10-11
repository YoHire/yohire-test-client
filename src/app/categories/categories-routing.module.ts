import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageCategoriesComponent } from './manage-categories/manage-categories.component';
import { ManageSubCategoriesComponent } from './manage-sub-categories/manage-sub-categories.component';

const routes: Routes = [
  { path: 'manage', component: ManageCategoriesComponent },
  {
    path: 'subCategory/manage/:catId',
    component: ManageSubCategoriesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoriesRoutingModule {}

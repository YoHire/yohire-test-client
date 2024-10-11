import { NgModule } from '@angular/core';
import { SearchComponent } from './search/search.component';
import { SearchListComponent } from './search-list/search-list.component';
import { CircleRoutingModule } from './circle.routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { DropdownModule } from 'primeng/dropdown';
import {
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { AuthModule } from '../auth/auth.module';
import { MatSliderModule } from '@angular/material/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [SearchComponent, SearchListComponent],
  imports: [
    CommonModule,
    ProgressBarModule,
    CircleRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SkeletonModule,
    DialogModule,
    ButtonModule,
    SidebarModule,
    DropdownModule,
    MatSnackBarModule,
    AuthModule,
    SidebarModule,
    MatSliderModule,
    MultiSelectModule,
    ScrollPanelModule,
    TooltipModule,
  ],
})
export class CircleModule {}

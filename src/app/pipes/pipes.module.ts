import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortPipe } from './sort.pipe';
import { AbsPipe } from './abs.pipe';

@NgModule({
  declarations: [SortPipe, AbsPipe],
  imports: [CommonModule],
  exports: [SortPipe, AbsPipe],
})
export class PipesModule {}

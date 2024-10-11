import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputNumbersOnlyDirective } from './input-numbers-only.directive';
import { InputTextOnlyDirective } from './input-text-only.directive';
import { TrimDirective } from './input-trim.directive';

@NgModule({
  declarations: [
    InputNumbersOnlyDirective,
    InputTextOnlyDirective,
    TrimDirective,
  ],
  imports: [CommonModule],
  exports: [InputNumbersOnlyDirective, InputTextOnlyDirective, TrimDirective],
})
export class DirectivesModule {}

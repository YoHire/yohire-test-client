import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: 'input[numbersOnly]',
})
export class InputNumbersOnlyDirective {
  @Output() valueChange = new EventEmitter();
  constructor(private _el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: KeyboardEvent) {
    const initalValue = this._el.nativeElement.value;
    const newValue = initalValue.replace(/[^0-9]*/g, '');
    this._el.nativeElement.value = newValue;
    this.valueChange.emit(newValue);
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}

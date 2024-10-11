import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: 'input[textOnly]',
})
export class InputTextOnlyDirective {
  @Output() valueChange = new EventEmitter();
  constructor(private _el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: KeyboardEvent) {
    const initalValue = this._el.nativeElement.value;
    const newValue = initalValue.replace(/^[a-zA-Z]+$/, '');
    this._el.nativeElement.value = newValue;
    this.valueChange.emit(newValue);
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}

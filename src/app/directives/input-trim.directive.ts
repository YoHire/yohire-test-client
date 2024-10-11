import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import { NgZone } from '@angular/core';

@Directive({
  selector: '[appTrim]',
})
export class TrimDirective {
  constructor(
    private _el: ElementRef,
    @Optional() private control: NgControl,
    private ngZone: NgZone
  ) {}

  @HostListener('blur') onBlur() {
    const trimmedValue = this._el.nativeElement.value.trim();
    if (trimmedValue !== this._el.nativeElement.value) {
      this._el.nativeElement.value = trimmedValue;
      if (this.control && this.control.control) {
        this.ngZone.run(() => {
          if (this.control.control) {
            this.control.control.setValue(trimmedValue, { emitEvent: false });
          }
        });
      }
    }
  }
}

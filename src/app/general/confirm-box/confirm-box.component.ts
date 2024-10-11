import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-box',
  templateUrl: './confirm-box.component.html',
})
export class ConfirmBoxComponent implements OnInit {
  @ViewChild('closeBtn') public closeBtn: ElementRef | undefined;

  constructor() {}

  @Input() title: String = 'Confirm';
  @Input() message: String = 'You really want to continue?';
  @Input() buttonText: String = 'Proceed';

  @Output() ConfirmEvent = new EventEmitter<boolean>();

  ngOnInit(): void {}

  submit() {
    this.closeBtn?.nativeElement.click();
    this.ConfirmEvent.emit(true);
  }
}

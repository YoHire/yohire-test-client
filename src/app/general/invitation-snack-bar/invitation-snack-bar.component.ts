import { Component, Inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-invitation-snack-bar',
  templateUrl: './invitation-snack-bar.component.html',
})
export class InvitationSnackBarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackBarRef: MatSnackBarRef<InvitationSnackBarComponent>
  ) {}
  closeSnackbar() {
    this.snackBarRef.dismiss();
  }
}

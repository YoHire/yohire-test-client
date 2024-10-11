import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmBoxComponent } from './confirm-box/confirm-box.component';
import { FormsModule } from '@angular/forms';
import { InvitationSnackBarComponent } from './invitation-snack-bar/invitation-snack-bar.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ConfirmBoxComponent, InvitationSnackBarComponent],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [ConfirmBoxComponent, InvitationSnackBarComponent],
})
export class GeneralModule {}

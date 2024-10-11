import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesRoutingModule } from './messages-routing.module';
import { ManageMessageComponent } from './manage-message/manage-message.component';
import { MessageFormComponent } from './message-form/message-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ManageMessageComponent, MessageFormComponent],
  imports: [
    CommonModule,
    MessagesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class MessagesModule {}

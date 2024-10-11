import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InvitationsRoutingModule } from './invitations-routing.module';
import { FoldersListComponent } from './folders-list/folders-list.component';
import { InvitedQueueDetailsComponent } from './invited-queue-details/invited-queue-details.component';
import { SkeletonModule } from 'primeng/skeleton';

@NgModule({
  declarations: [FoldersListComponent, InvitedQueueDetailsComponent],
  imports: [CommonModule, InvitationsRoutingModule, SkeletonModule],
})
export class InvitationsModule {}

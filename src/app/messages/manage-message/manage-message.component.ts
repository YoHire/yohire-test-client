import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Message } from 'src/app/models/message';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-manage-message',
  templateUrl: './manage-message.component.html',
})
export class ManageMessageComponent implements OnInit {
  trackByItemId = trackByItemId;
  messages!: Message[];
  messagesUF!: Message[];

  messagesReceived!: Message[];
  messagesUFReceived!: Message[];

  search: String = '';

  id: number = 0;
  modalTitle: String = 'Create';

  user: String = '';
  message: String = '';
  title: String = '';

  pageCount: number = 0;
  page: number = 0;
  size: number = 20;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;

  role: RoleName | null = null;
  selectedTab: string = 'received';

  @ViewChild('closeBtn')
  closeModal!: ElementRef;

  loginUser: string = '';

  constructor(
    private messageService: MessageService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    public pageLocation: Location,
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getCurrentUserRole();
    if (this.role == RoleName.ROLE_SUPER_ADMIN) this.loginUser = '-admin';
    this.activatedRoute.params.subscribe((params) => {
      this.selectedTab = params['tab'] ?? 'received';
    });
    this.listItems();
  }

  listItems() {
    // if (this.role == RoleName.ROLE_SUPER_ADMIN)
    this.listSend();
    // else
    this.listRecevied();
  }

  listSend() {
    this.messageService
      .listSend()
      .pipe()
      .subscribe({
        next: (data) => {
          this.messages = data;
          this.messages = this.messages.filter((x) => x.status !== 'DELETED');
          this.messages.reverse();
          this.messagesUF = this.messages;
        },
        error: (error) => {
          this.notificationService.showError('Data Error', error.error.message);
        },
      });
  }

  listRecevied() {
    this.messageService
      .listRecevied()
      .pipe()
      .subscribe({
        next: (data) => {
          this.messagesReceived = data;
          this.messagesReceived = this.messagesReceived.filter(
            (x) => x.status !== 'DELETED'
          );
          this.messagesReceived.reverse();
          this.messagesUFReceived = this.messagesReceived;
        },
        error: (error) => {
          this.notificationService.showError('Data Error', error.error.message);
        },
      });
  }

  new() {
    this.modalTitle = 'Create';
    this.id = 0;

    this.user = '';
    this.title = '';
    this.message = '';
  }

  save() {
    let receiver = 'recruiter';
    if (this.role == 'RECRUITER') {
      receiver = 'admin';
    }

    this.user = localStorage.getItem('user_id') ?? '';
    if (this.user.length < 1) {
      this.notificationService.showError(
        'Invalied Data',
        'Please enter user id and try again'
      );
      return;
    }
    if (this.title.length < 1) {
      this.notificationService.showError(
        'Invalied Data',
        'Please enter title and try again'
      );
      return;
    }
    if (this.message.length < 1) {
      this.notificationService.showError(
        'Invalied Data',
        'Please enter message and try again'
      );
      return;
    }

    if (this.id > 0) {
      this.messageService
        .update(this.id, this.user, false, this.title, this.message, 'ACTIVE')
        .pipe()
        .subscribe({
          next: (data) => {
            this.listItems();
            this.closeModal.nativeElement.click();
            this.notificationService.showSuccess('Done', '');
          },
          error: (error) => {
            this.notificationService.showError('Failed', error);
          },
        });
    } else {
      this.messageService
        .save(
          this.user,
          false,
          this.title,
          this.message,
          'ACTIVE',
          receiver,
          []
        )
        .pipe()
        .subscribe({
          next: () => {
            this.listItems();
            this.closeModal.nativeElement.click();
            this.notificationService.showSuccess('Done', '');
          },
          error: (error) => {
            this.notificationService.showError('Failed', error);
          },
        });
    }
  }

  edit(i: number) {
    this.modalTitle = 'Update';
    this.id = this.messages[i].id;

    this.user = this.messages[i].creator.id + '';
    this.title = this.messages[i].title;
    this.message = this.messages[i].message;
  }

  // enableDisable(i: number) {
  //   var status: String = "ACTIVE";
  //   if (this.messages[i].status == "ACTIVE") { status = "INACTIVE"; }
  //   if (confirm("Are you sure to continue with message #" + this.messages[i].id)) {
  //     this.messageService.update(
  //       this.messages[i].id,
  //       this.messages[i].user.id + "", this.messages[i].isSeen, this.messages[i].title, this.messages[i].message, status,
  //     ).pipe().subscribe(
  //       data => {
  //         this.listItems();
  //         if (data.success) {
  //           this.notificationService.showSuccess("Done", data.message);
  //         } else
  //           this.notificationService.showError("Failed", data.message);
  //       }, error => {
  //         this.notificationService.showError("Failed", error);
  //       }
  //     );
  //   }
  // }

  remove(i: number) {
    if (
      confirm('Are you sure to remove message with #' + this.messages[i].id)
    ) {
      this.messageService
        .remove(this.messages[i].id)
        .pipe()
        .subscribe({
          next: (data) => {
            this.listItems();
            if (data.success) {
              this.notificationService.showSuccess('Done', data.message);
            } else {
              this.notificationService.showError('Failed', data.message);
            }
          },
          error: (error) => {
            this.notificationService.showError('Failed', error);
          },
        });
    }
  }

  filter() {
    this.messages = this.messagesUF.filter(
      (x) =>
        x.title.toLowerCase().indexOf(this.search.toString().toLowerCase()) >=
          0 ||
        x.creator.name
          .toLowerCase()
          .indexOf(this.search.toString().toLowerCase()) >= 0
    );
  }
}

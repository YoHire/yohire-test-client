import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { CircleService } from 'src/app/services/circle.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-folders-list',
  templateUrl: './folders-list.component.html',
})
export class FoldersListComponent {
  loginUser: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;

  constructor(
    private circleService: CircleService,
    private router: Router,
    private authService: AuthService,
    public pageLocation: Location
  ) {}

  invitedJobs: any;

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';
    this.listInvitedJobs();
  }

  listInvitedJobs() {
    this.circleService
      .listInvitedJobs(this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (items: any) => {
          this.invitedJobs = items.data;
          this.totalPages = items.totalPages;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.listInvitedJobs();
  }
  onInvitedJobClick(id: string): void {
    this.router.navigate(['/invitations/details', id]);
  }
}

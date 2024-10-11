import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidebar-admin',
  templateUrl: './sidebar-admin.component.html',
})
export class SidebarAdminComponent implements OnInit {
  public isCollapsed = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {}

  userData: User = this.authService.currentUserValue.user;

  logout() {
    this.authService.signout();
  }
}

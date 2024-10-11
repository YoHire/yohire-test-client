import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidebar-support',
  templateUrl: './sidebar-support.component.html',
})
export class SidebarSupportComponent implements OnInit {
  public isCollapsed = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {}

  userData: User = this.authService.currentUserValue.user;

  logout() {
    this.authService.signout();
  }
}

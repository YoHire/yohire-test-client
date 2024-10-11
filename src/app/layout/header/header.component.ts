import { Component, OnInit } from '@angular/core';
import { RoleName } from 'src/app/models/roleName';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  constructor(private authService: AuthService) {}

  userData: User = this.authService.currentUserValue.user;
  role: RoleName | null = null;

  ngOnInit(): void {
    this.getRole();
  }

  getRole() {
    if (this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN)) {
      this.role = RoleName.ROLE_SUPER_ADMIN;
    } else if (this.authService.hasRole(RoleName.ROLE_ADMIN)) {
      this.role = RoleName.ROLE_ADMIN;
    } else if (this.authService.hasRole(RoleName.ROLE_RECRUITER)) {
      this.role = RoleName.ROLE_RECRUITER;
    }
  }

  logout() {
    this.authService.signout();
  }
}

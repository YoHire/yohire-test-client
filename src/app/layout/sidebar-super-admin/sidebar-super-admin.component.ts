import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidebar-super-admin',
  templateUrl: './sidebar-super-admin.component.html',
})
export class SidebarSuperAdminComponent implements OnInit {
  showNames = false;
  showNamesTimeout: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}
  userData: User = this.authService.currentUserValue.user;
  logout() {
    this.authService.signout();
  }
  @HostListener('mouseover')
  onMouseOver() {
    clearTimeout(this.showNamesTimeout);
    this.showNamesTimeout = setTimeout(() => {
      this.showNames = true;
    }, 0);
  }

  @HostListener('mouseout')
  onMouseOut() {
    clearTimeout(this.showNamesTimeout);
    this.showNamesTimeout = setTimeout(() => {
      this.showNames = false;
    }, 0);
  }
  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }
}

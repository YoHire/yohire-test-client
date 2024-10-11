import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-private-layout',
  templateUrl: './private-layout.component.html',
})
export class PrivateLayoutComponent implements OnInit {
  isCollapsed: boolean = true;
  role: RoleName | null = null;
  currentUrl: string = '';

  constructor(
    private authService: AuthService,
    public generalService: GeneralService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });
    }

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
    this.cdr.detectChanges();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}

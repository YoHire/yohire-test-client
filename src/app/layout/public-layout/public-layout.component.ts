import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent implements OnInit {
  displayPublicLayout: boolean = false;
  constructor(private router: Router, public authService: AuthService) {
    if (localStorage.getItem('user_id') ?? ''.length > 0) {
      this.router.navigate(['/']);
      this.displayPublicLayout = true
    }
  }

  ngOnInit(): void {}
  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }
  // logout() {
  //   this.displayPublicLayout = !this.displayPublicLayout;
  //   this.authService.signout();
  // }
}

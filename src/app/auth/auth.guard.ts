import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;    

    if (currentUser) {
      if (state.url === '/') {
        this.router.navigate(['/home/dashboard']);
        return false;
      }
      if (
        route.data.roles &&
        !this.hasRequiredRole(route.data.roles, currentUser.user.authorities)
      ) {
        this.router.navigate(['/']);
        return false;
      }

      return true;
    }
    this.router.navigate(['/']);
    return false;
  }

  private hasRequiredRole(
    requiredRoles: string[],
    userRoles: string[]
  ): boolean {
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}

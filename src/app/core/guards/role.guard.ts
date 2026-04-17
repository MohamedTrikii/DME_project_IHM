import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRoles = route.data['roles'] as string[] | undefined;
    const userRole = this.auth.getRole();

    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }

    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/login']);
    }

    if (!userRole || !expectedRoles.includes(userRole)) {
      return this.router.createUrlTree([this.auth.getDashboardRoute(userRole)]);
    }

    return true;
  }
}
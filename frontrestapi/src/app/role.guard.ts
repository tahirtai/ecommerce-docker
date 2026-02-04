import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userRole = localStorage.getItem('role');  // get role from localStorage
    const expectedRole = route.data['expectedRole']; // get role required for this route

    if (userRole === expectedRole) {
      return true;  // allow access
    } else {
      // Redirect to home or login
      this.router.navigate(['/']);
      return false;
    }
  }
}

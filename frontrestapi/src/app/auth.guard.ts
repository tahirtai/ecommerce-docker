import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = localStorage.getItem('username') !== null;

    if (isLoggedIn) {
      return true;  // User is logged in → allow access
    } else {
      this.router.navigate(['/login']);  // Not logged in → go to login page
      return false;
    }
  }
}

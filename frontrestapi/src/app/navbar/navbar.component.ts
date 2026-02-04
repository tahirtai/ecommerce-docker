import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private router: Router) {}

  // Check if user is logged in
  isLoggedIn(): boolean {
    return localStorage.getItem('username') !== null;
  }

  // Get username (optional - for display)
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  // Logout function
  logout(): void {
    localStorage.clear();  // remove username & role
    this.router.navigate(['/login']);  // go to login page
  }
}

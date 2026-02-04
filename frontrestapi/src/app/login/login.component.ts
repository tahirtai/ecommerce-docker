import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMsg = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    const data = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>(`${environment.apiUrl}/login/`, data).subscribe({
      next: (response) => {
        console.log(response);
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);

        if (response.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (response.role === 'user') {
          this.router.navigate(['/products']);
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Invalid username or password';
      }
    });
  }
}

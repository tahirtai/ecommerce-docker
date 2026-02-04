import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username = '';
  password = '';
  mobno = '';
  errorMsg = '';
  successMsg = '';

  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {
    const data = {
      username: this.username,
      password: this.password,
      mobno: this.mobno
    };

    this.http.post<any>('http://127.0.0.1:8000/register/', data).subscribe({
      next: (response) => {
        console.log(response);
        this.successMsg = 'Registration successful! Please login.';
        this.errorMsg = '';
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 400 && err.error.error === 'Username already exists') {
          this.errorMsg = 'Username already exists!';
        } else {
          this.errorMsg = 'Registration failed!';
        }
        this.successMsg = '';
      }
    });
  }
}

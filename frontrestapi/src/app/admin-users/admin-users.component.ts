import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<any[]>('http://127.0.0.1:8000/getUser/')
      .subscribe({
        next: (data) => {
          this.users = data;
        },
        error: (err) => {
          console.error('Error fetching users:', err);
        }
      });
  }

  deleteUser(username: string) {
    if (!confirm(`Are you sure you want to delete user: ${username}?`)) {
      return;
    }

    this.http.delete(`http://127.0.0.1:8000/deleteUser/${username}`)
      .subscribe({
        next: (res) => {
          alert('User deleted successfully!');
          this.fetchUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Error deleting user');
        }
      });
  }

  promoteUser(username: string) {
    if (!confirm(`Promote ${username} to Admin?`)) {
      return;
    }

    const body = { username: username };

    this.http.put(`http://127.0.0.1:8000/promoteUser/`, body)
      .subscribe({
        next: (res: any) => {
          alert(res.message || 'User promoted!');
          this.fetchUsers();
        },
        error: (err) => {
          console.error('Error promoting user:', err);
          alert('Error promoting user');
        }
      });
  }
}

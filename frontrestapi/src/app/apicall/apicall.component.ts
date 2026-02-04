import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserData } from '../arrayex/arrayex.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  // standalone: true,
  // imports: [CommonModule, FormsModule , HttpClientModule],
  selector: 'app-apicall',
  templateUrl: './apicall.component.html',
  styleUrls: ['./apicall.component.css']
})
export class ApicallComponent {
  users: any = [];
  userdata: UserData = new UserData("", "", 0);
  message: string = "";

  constructor(private httpclient: HttpClient) {}
  allUsers() 
  {
    this.httpclient.get(`${environment.apiUrl}/getUser/`).subscribe((array: any) => {this.users = array;
        console.log(this.users);
      });
  }
  getUserByName() {
  const username = this.userdata.username?.trim();

  if (!username) {
    this.message = "Please enter a username.";
    return;
  }

  this.httpclient.get<any>(`${environment.apiUrl}/getUsername/${username}`)
    .subscribe({
      next: (response) => {
        // Map JSON to class object
        this.userdata = new UserData(
          response.username || '',
          response.password || '',
          response.mobno || 0
        );
        this.message = "User found successfully!";
      },
      error: (error) => {
        console.error("API Error:", error);
        this.message = "User not found or server error.";
        this.userdata = new UserData('', '', 0);
      }
    });
}
adduser() {
  if (!this.userdata.username.trim() || !this.userdata.password.trim() || !this.userdata.mobno) {
    this.message = "Please fill all fields before submitting.";
    return;
  }

  this.httpclient.post(`${environment.apiUrl}/addUser/`, this.userdata)
    .subscribe(() => this.message = "User added successfully!");
}

deleteUser() {
  const username = this.userdata.username;

  this.httpclient.delete(`${environment.apiUrl}/deleteUser/${username}`)
    .subscribe({
      next: () => this.message = "Record deleted",
      error: (err) => {
        console.error("Delete Error:", err);
        this.message = "Failed to delete user";
      }
    });
}


updateUser()
{
   this.httpclient.put(`${environment.apiUrl}/updateUser/`,this.userdata).subscribe(message=>this.message="Record updated")
}
}
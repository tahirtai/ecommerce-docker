import { Component } from '@angular/core';

@Component({
  selector: 'app-arrayex',
  templateUrl: './arrayex.component.html',
  styleUrls: ['./arrayex.component.css']
})
export class ArrayexComponent {
 userdata1 = new UserData("john", "john123", 1234567890);
 userdata2 = new UserData("Taheer", "Taheer123", 8999040147);
 users = [this.userdata1, this.userdata2];

}
export class UserData
{
  username: string
  password: string
  mobno:number

  constructor(username: string, password: string, mobno: number) {
    this.username = username;
    this.password = password;
    this.mobno = mobno;
  }

}


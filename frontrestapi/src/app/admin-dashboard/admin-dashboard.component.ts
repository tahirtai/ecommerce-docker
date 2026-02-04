import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  dashboardData: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardSummary();
  }

  loadDashboardSummary() {
    this.http.get<any>('http://127.0.0.1:8000/dashboardSummary/')
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
        },
        error: (err) => {
          console.error('Error loading dashboard summary:', err);
        }
      });
  }

}

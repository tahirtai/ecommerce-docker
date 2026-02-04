import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration, ChartDataset, ChartOptions } from 'chart.js';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {

  monthlySalesData: any[] = [];

  // Sales Chart
  barChartLabels: string[] = [];
  barChartDataSales: ChartDataset[] = [
    { data: [], label: 'Total Sales ₹', backgroundColor: '#42A5F5', borderRadius: 10 }
  ];
  barChartDataOrders: ChartDataset[] = [
    { data: [], label: 'Order Count', backgroundColor: '#66BB6A', borderRadius: 10 }
  ];

  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutBounce'
    },
    plugins: {
      legend: {
        display: true,
        labels: { color: '#333' }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: { color: '#333' },
        grid: { color: '#ddd' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#333' },
        grid: { color: '#ddd' }
      }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMonthlySales();
  }

  loadMonthlySales() {
    this.http.get<any[]>(`${environment.apiUrl}/getMonthlySalesSummary/`)
      .subscribe({
        next: (data) => {
          this.monthlySalesData = data;

          this.barChartLabels = data.map(item => item.month);
          this.barChartDataSales[0].data = data.map(item => item.total_sales);
          this.barChartDataOrders[0].data = data.map(item => item.order_count);

          console.log('Loaded Monthly Sales:', this.monthlySalesData);
        },
        error: (err) => {
          console.error('Error loading monthly sales summary:', err);
        }
      });
  }

  downloadCSV() {
    const csvRows = [
      ['Month', 'Total Sales ₹', 'Order Count'],
      ...this.monthlySalesData.map(item => [
        `"${item.month}"`,
        item.total_sales,
        item.order_count
      ])
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.href = url;
    a.download = 'Monthly_Sales_Report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  printReport() {
    window.print();
  }

}

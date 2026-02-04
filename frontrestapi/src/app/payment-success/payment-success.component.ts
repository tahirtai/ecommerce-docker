import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  orderId: string | null = null;
  orderDetails: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    if (this.orderId) {
      this.http.get(`${environment.apiUrl}/getOrderDetails/${this.orderId}/`)
        .subscribe({
          next: (data) => {
            this.orderDetails = data;
          },
          error: (err) => {
            console.error('Error fetching order details:', err);
          }
        });
    }
  }
}

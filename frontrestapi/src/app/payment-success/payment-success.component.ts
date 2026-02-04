import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
      this.http.get(`http://127.0.0.1:8000/getOrderDetails/${this.orderId}/`)
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

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

// ✅ Interfaces
interface OrderItem {
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

interface Order {
  id: number;
  order_date: string;
  total_price: number;
  status: string;
  payment_status?: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  username: string | null = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    if (this.username) {
      this.fetchOrders();
    }
  }

  fetchOrders(): void {
    if (!this.username) return;

    this.http.get<Order[]>(`http://127.0.0.1:8000/getOrders/${this.username}/`)
      .subscribe({
        next: (data) => {
          this.orders = data;
        },
        error: (err) => {
          console.error('Error fetching orders:', err);
          alert('Failed to fetch orders.');
        }
      });
  }

  cancelOrder(orderId: number): void {
    if (!this.username) {
      alert('No username found.');
      return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) return;

    const payload = {
      order_id: orderId,
      username: this.username
    };

    this.http.patch(`http://127.0.0.1:8000/cancelOrder/`, payload)
      .subscribe({
        next: () => {
          alert('Order cancelled successfully.');
          this.fetchOrders();
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
          alert('Error cancelling order.');
        }
      });
  }

  // 🔧 Recalculates total based on item subtotals
  getOrderTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // 🔧 NEW: Calculate ETA (5 days after order date)
  getETA(orderDateStr: string): string {
    const orderDate = new Date(orderDateStr);
    const etaDate = new Date(orderDate);
    etaDate.setDate(orderDate.getDate() + 5);

    return etaDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

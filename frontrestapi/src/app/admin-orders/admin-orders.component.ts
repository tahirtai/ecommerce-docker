import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

// ✅ Interfaces
interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  image_url?: string;
}

interface Order {
  id: number;
  total_price: number;
  order_date: string;
  status: string;
  user?: { username: string };
  username: string;     
  items: OrderItem[];
}

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  adminUsername: string | null = '';
  statusFilter: string = 'Pending';
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  isLoading: boolean = false;

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.adminUsername = localStorage.getItem('username');
    this.fetchOrders();
  }

  //  Fetch Orders
  fetchOrders(): void {
    this.isLoading = true;
    const url = `${this.baseUrl}/filterOrders/all/${this.statusFilter}/?search=${this.searchQuery}&page=${this.currentPage}&page_size=${this.pageSize}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.orders = res.orders;
        this.totalPages = res.total_pages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        alert('Failed to fetch orders.');
        this.isLoading = false;
      }
    });
  }

  //  On Filter Change
  onFilterChange(): void {
    this.currentPage = 1;
    this.fetchOrders();
  }

  // Complete Order
  completeOrder(orderId: number): void {
    if (!confirm('Are you sure you want to mark this order as completed?')) return;

    const payload = { order_id: orderId, admin_username: this.adminUsername };

    this.http.patch(`${this.baseUrl}/completeOrder/`, payload).subscribe({
      next: () => {
        alert(' Order marked as Completed.');
        this.fetchOrders();
      },
      error: (err) => {
        console.error('Error completing order:', err);
        alert(' Error completing order.');
      }
    });
  }

  //  Cancel Order
  cancelOrder(orderId: number, username: string): void {
    if (!username) {
      alert('Username missing, cannot cancel.');
      return;
    }
    if (!confirm('Are you sure you want to cancel this order?')) return;

    const payload = { order_id: orderId, username: username };

    this.http.patch(`${this.baseUrl}/cancelOrder/`, payload).subscribe({
      next: () => {
        alert('🚫 Order cancelled.');
        this.fetchOrders();
      },
      error: (err) => {
        console.error('Error cancelling order:', err);
        alert(' Error cancelling order.');
      }
    });
  }

  //  Delete Order
  deleteOrder(orderId: number): void {
    if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) return;

    const url = `${this.baseUrl}/deleteOrder/${orderId}/?admin_username=${this.adminUsername}`;

    this.http.delete(url).subscribe({
      next: () => {
        alert(' Order deleted.');
        this.fetchOrders();
      },
      error: (err) => {
        console.error('Error deleting order:', err);
        alert(' Error deleting order.');
      }
    });
  }

  //  Pagination
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchOrders();
    }
  }
}

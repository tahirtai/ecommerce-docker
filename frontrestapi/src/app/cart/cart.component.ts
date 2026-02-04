import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  username: string | null = '';
  totalPrice: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    if (this.username) {
      this.fetchCart();
    }
  }

  fetchCart() {
    this.http.get<any[]>(`http://127.0.0.1:8000/getCart/${this.username}/`)
      .subscribe({
        next: (data) => {
          this.cartItems = data;
          this.calculateTotal();
        },
        error: (err) => {
          console.error('Error fetching cart:', err);
        }
      });
  }

  calculateTotal() {
    this.totalPrice = this.cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }

  increaseQuantity(item: any) {
    if (item.quantity < item.max_stock) {
      item.quantity += 1;
      this.updateCart(item);
    }
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.updateCart(item);
    }
  }

  updateCart(item: any) {
    const payload = {
      username: this.username,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      image_url: item.image_url
    };

    this.http.post('http://127.0.0.1:8000/addToCart/', payload)
      .subscribe({
        next: (res) => {
          console.log('Cart updated:', res);
          this.calculateTotal();
        },
        error: (err) => {
          console.error('Error updating cart:', err);
        }
      });
  }

  removeFromCart(item: any) {
    if (!this.username) return;

    const url = `http://127.0.0.1:8000/removeCartItem/${this.username}/${item.product_id}/`;

    this.http.delete(url, {}).subscribe({
      next: (res) => {
        console.log('Removed from cart:', res);
        alert(`Removed "${item.product_name}" from cart!`);
        this.fetchCart();
      },
      error: (err) => {
        console.error('Error removing from cart:', err);
        alert('Error removing item from cart');
      }
    });
  }

  checkout() {
    alert('Checkout functionality coming soon!');
    // Optional: post order to backend
  }
}

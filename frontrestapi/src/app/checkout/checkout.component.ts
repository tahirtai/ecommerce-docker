import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  username: string | null = '';
  totalPrice: number = 0;

  address: string = '';
  paymentMethod: string = 'COD'; // default

  constructor(private http: HttpClient, private router: Router) {}

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

  placeOrder() {
    if (!this.username || this.cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (this.address.trim() === '') {
      alert('Please enter delivery address!');
      return;
    }

    if (this.paymentMethod === 'COD') {
      const payload = {
        username: this.username,
        address: this.address,
        paymentMethod: 'COD'
      };

      this.http.post<any>('http://127.0.0.1:8000/placeOrder/', payload)
        .subscribe({
          next: (res) => {
            console.log('COD Order placed:', res);
            alert('Order placed with Cash on Delivery!');
            setTimeout(() => {
              this.router.navigate(['/my-orders']);
            }, 100);
          },
          error: (err) => {
            console.error('Error placing COD order:', err);
            alert('Error placing order');
          }
        });
    } else if (this.paymentMethod === 'Online') {
      this.startOnlinePayment();
    }
  }

  startOnlinePayment() {
    if (!this.username || this.cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (this.address.trim() === '') {
      alert('Please enter delivery address!');
      return;
    }

    this.http.post<any>('http://127.0.0.1:8000/createRazorpayOrder/', {
      amount: this.totalPrice,
      username: this.username,
      address: this.address,
      paymentMethod: 'Online'
    }).subscribe({
      next: (orderRes) => {
        console.log('Razorpay order created:', orderRes);
        this.openRazorpay(orderRes.order_id, this.totalPrice, orderRes.order_db_id);
      },
      error: (err) => {
        console.error('Error creating payment order:', err);
        alert('Unable to start payment. Try again.');
      }
    });
  }

  openRazorpay(razorpayOrderId: string, amount: number, dbOrderId: number) {
    const options: any = {
      key: 'rzp_test_JXRn3gzDuDb3AM',
      amount: amount * 100,
      currency: 'INR',
      name: 'BuyBlox',
      description: 'Order Payment',
      order_id: razorpayOrderId,
      prefill: {
        name: this.username ?? '',
        email: 'tahirtai147@gmail.com',
        contact: '8999040147'
      },
      theme: { color: '#3399cc' },
      handler: (response: any) => {
        console.log('Payment success response:', response);
        // ✅ Ensure Razorpay order ID is included
        response.razorpay_order_id = razorpayOrderId;
        this.verifyPaymentOnBackend(response, dbOrderId);
      }
    };

    const rzp1 = new (window as any).Razorpay(options);
    rzp1.open();
  }

  verifyPaymentOnBackend(response: any, dbOrderId: number) {
    const payload = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    };

    this.http.post('http://127.0.0.1:8000/verifyPayment/', payload)
      .subscribe({
        next: () => {
          alert('Payment verified successfully!');
          this.router.navigate(['/payment-success', dbOrderId]);
        },
        error: (err) => {
          console.error('Error verifying payment:', err);
          alert('Payment verification failed.');
        }
      });
  }
}

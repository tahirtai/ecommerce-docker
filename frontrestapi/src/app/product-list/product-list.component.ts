import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  username: string | null = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    this.fetchProducts();
  }

  fetchProducts() {
    this.http.get<any[]>(`${environment.apiUrl}/getAllProducts/`)
      .subscribe({
        next: (data) => {
          this.products = data;
        },
        error: (err) => {
          console.error('Error fetching products:', err);
        }
      });
  }

  addToCart(product: any) {
    if (!this.username) {
      alert('Please login first!');
      return;
    }

    const payload = {
      username: this.username,
      product_id: product.product_id,
      product_name: product.product_name,
      quantity: 1,
      price: product.price,
      image_url: product.image_url
    };

    this.http.post(`${environment.apiUrl}/addToCart/`, payload)
      .subscribe({
        next: (res) => {
          console.log('Added to cart:', res);
          alert(` Added "${product.product_name}" to cart!`);
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          alert(' Error adding to cart!');
        }
      });
  }

  buyNow(product: any) {
    if (!this.username) {
      alert('Please login first!');
      return;
    }

    const payload = {
      username: this.username,
      product_id: product.product_id,
      product_name: product.product_name,
      quantity: 1,
      price: product.price,
      image_url: product.image_url
    };

    this.http.post(`${environment.apiUrl}/addToCart/`, payload)
      .subscribe({
        next: (res) => {
          console.log('Added to cart for buy-now:', res);
          // after adding → go to cart page
          setTimeout(() => {
            this.router.navigate(['/cart']);
          }, 300); // small delay
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          alert(' Error adding to cart!');
        }
      });
  }
}

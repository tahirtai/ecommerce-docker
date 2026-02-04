import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  username: string | null = '';

  // ✅ Add your 4 different static images here
  bestSellers = [
    { img: 'assets/images/hood.png', name: 'Hoodie Classic', price: '₹1499' },
    { img: 'assets/images/hood2.png', name: 'Street Style Tee', price: '₹999' },
    { img: 'assets/images/hood4.png', name: 'Korean Wear', price: '₹1999' },
    { img: 'assets/images/hood5.png', name: 'Accessories', price: '₹1299' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
  }
getShopLink(): string {
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  if (username && role === 'user') {
    return '/products';
  }
  return '/login';  // default fallback
}




  addToCart(item: any) {
    this.router.navigate(['/products']);
  }
}

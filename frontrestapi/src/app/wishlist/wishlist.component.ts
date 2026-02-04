import { Component } from '@angular/core';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent {
  wishlistItems = [
    {
      name: 'Oldschool wear',
      price: 1499,
      image: 'assets/images/hood3.png'
    },
    {
      name: 'Minimalist Tee',
      price: 999,
      image: 'assets/images/womencard.png'
    },
    {
      name: 'Denim Cargo Pants',
      price: 2199,
      image: 'assets/images/CargoDenim.png'
    }
  ];

  addToCart(item: any): void {
    // ✅ Replace with actual cart service logic
    console.log('Added to cart:', item);
    alert(`"${item.name}" added to cart.`);
  }

  removeFromWishlist(item: any): void {
    this.wishlistItems = this.wishlistItems.filter(i => i !== item);
  }
}

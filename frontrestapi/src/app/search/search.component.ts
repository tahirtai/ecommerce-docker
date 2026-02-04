import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
  rating: number;
  discount?: number; // optional
  popularity?: number;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  Math = Math; // ✅ Add this line

  query: string = '';
  selectedCategory: string = 'All';
  sortOption: string = 'default';

  products: Product[] = [
    {
      id: 1,
      name: 'Classic Hoodie',
      price: 1499,
      category: 'Men',
      image_url: 'assets/images/hood2.png',
      rating: 4.5,
      discount: 20,
      popularity: 100
    },
    {
      id: 2,
      name: 'Minimalist Tee',
      price: 999,
      category: 'Women',
      image_url: 'assets/images/women.png',
      rating: 4.2,
      discount: 10,
      popularity: 80
    },
    {
      id: 3,
      name: 'Denim Cargo Pants',
      price: 2199,
      category: 'Unisex',
      image_url: 'assets/images/CargoDenim.png',
      rating: 4.7,
      popularity: 95
    }
  ];

  filteredProducts: Product[] = [];

  ngOnInit(): void {
    this.filterAndSort();
  }

  onSearch(): void {
    this.filterAndSort();
  }

  filterAndSort(): void {
    const query = this.query.trim().toLowerCase();
    this.filteredProducts = this.products.filter(product => {
      const matchesQuery = product.name.toLowerCase().includes(query);
      const matchesCategory = this.selectedCategory === 'All' || product.category === this.selectedCategory;
      return matchesQuery && matchesCategory;
    });

    switch (this.sortOption) {
      case 'priceLow':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        this.filteredProducts.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
        break;
    }
  }
}

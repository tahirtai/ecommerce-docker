import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  editingProduct: any = null;
  newProduct: any = {
    product_id: '',
    product_name: '',
    quantity: '',
    price: '',
    image_url: ''
  };

  showUpdateModal = false;
  showAddModal = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts() {
    this.http.get<any[]>(`${environment.apiUrl}/getAllProducts/`)
      .subscribe(data => {
        this.products = data;
      }, error => {
        console.error('Error fetching products:', error);
      });
  }

  openUpdateModal(product: any) {
    this.editingProduct = { ...product };
    this.showUpdateModal = true;
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
    this.editingProduct = null;
  }

  saveUpdateProduct() {
    this.http.put(`${environment.apiUrl}/updateProduct/`, this.editingProduct)
      .subscribe(response => {
        console.log('Product updated:', response);
        alert('Product updated successfully!');
        this.fetchProducts();
        this.closeUpdateModal();
      }, error => {
        console.error('Error updating product:', error);
        alert('Error updating product');
      });
  }

  deleteProduct(product: any) {
    if (!confirm(`Are you sure you want to delete product: ${product.product_name}?`)) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/deleteProduct/${product.product_id}`)
      .subscribe(response => {
        console.log('Product deleted:', response);
        alert('Product deleted successfully!');
        this.fetchProducts();
      }, error => {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      });
  }

  openAddModal() {
    this.newProduct = {
      product_id: '',
      product_name: '',
      quantity: '',
      price: '',
      image_url: ''
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveNewProduct() {
    const dataToSend = [
      {
        product_id: this.newProduct.product_id,
        product_name: this.newProduct.product_name,
        quantity: this.newProduct.quantity,
        price: this.newProduct.price,
        image_url: this.newProduct.image_url
      }
    ];

    this.http.post(`${environment.apiUrl}/addProduct/`, dataToSend)
      .subscribe(response => {
        console.log('Product added:', response);
        alert('Product added successfully!');
        this.fetchProducts();
        this.closeAddModal();
      }, error => {
        console.error('Error adding product:', error);
        alert('Error adding product');
      });
  }
}

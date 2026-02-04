import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminReportsComponent } from './admin-reports/admin-reports.component';
import { CartComponent } from './cart/cart.component';   

import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Product Page → for user
  { 
    path: 'products', 
    component: ProductListComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { expectedRole: 'user' } 
  }, 

  // Cart Page → for user
  { 
    path: 'cart', 
    component: CartComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { expectedRole: 'user' } 
  }, 

  // Admin Dashboard → for admin
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { expectedRole: 'admin' } 
  },

  // Admin sub-pages
  { 
    path: 'admin-products', 
    component: AdminProductsComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { expectedRole: 'admin' } 
  },
  { 
    path: 'admin-orders', 
    component: AdminOrdersComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { expectedRole: 'admin' } 
  },
  { 
    path: 'admin-users', 
    component: AdminUsersComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { expectedRole: 'admin' } 
  },
  { 
    path: 'admin-reports', 
    component: AdminReportsComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { expectedRole: 'admin' } 
  },

  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'my-orders', component: OrdersComponent },
  { path: 'payment-success/:orderId', component: PaymentSuccessComponent },
  { path: 'wishlist', component: WishlistComponent},
  { path: 'search',  component: SearchComponent}



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

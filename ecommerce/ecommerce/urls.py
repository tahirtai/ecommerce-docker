"""
URL configuration for ecommerce project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from ecomapp.views import addProduct, addToCart, addUser, cancelOrder, completeOrder, contact, create_razorpay_order, deleteOrder, deleteProduct, deleteUser, download_invoice, filterOrders, get_max_product, get_min_product, get_order_details, get_product_in, getAllProducts, getCart, getCartTotal, getDashboardSummary, getMonthlySalesSummary, getOrders, getProductById, getProductByName, getUser, getUsername, home, login, number_form_view, placeOrder, promoteUser, register, removeCartItem, updateCartQuantity, updateProduct, updateUser, verify_payment

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),

    # API URLs
    path('getUser/',getUser),
    path('getUsername/<username>', getUsername),
    path('get_max_product/',get_max_product),
    path('get_min_product/',get_min_product),
    path('get_product_in/<min>/<max>',get_product_in),
    path('addUser/', addUser),
    # product table apis
    path('getAllProducts/',getAllProducts),
    path('getProductById/<product_id>',getProductById),
    path('getProductByName/<product_name>',getProductByName), 
    path('addProduct/',addProduct),
    # delete product
    path('deleteProduct/<int:product_id>', deleteProduct),

    # Delete user
    path('deleteUser/<userfromclient>',deleteUser),
    # promote user to admin
    path('promoteUser/',promoteUser),
    #update user
    path('updateUser/',updateUser),
    path('updateProduct/', updateProduct),
    # contact us page
    path('contact/', contact),
    # inbuilt form templates
    path('number_form_view/',number_form_view), 
    # login using Api
    path('login/',login),
    # register using Api
    path('register/',register),

    #  Cart URLs
    path('addToCart/', addToCart),  # POST
    path('getCart/<str:usernamefromclient>/', getCart),#get
    path('updateCartQuantity/', updateCartQuantity),  # PUT
    path('removeCartItem/<str:usernamefromclient>/<int:product_id_from_client>/', removeCartItem),  # DELETE
    path('getCartTotal/<str:usernamefromclient>/', getCartTotal),#get

    #  Order URLs
    path('placeOrder/', placeOrder),  # POST
    path('getOrders/<str:usernamefromclient>/', getOrders),  # GET
    path('cancelOrder/', cancelOrder),   # PATCH
    path('completeOrder/', completeOrder),  # PATCH
    path('deleteOrder/<int:order_id>/', deleteOrder),  # DELETE
    path('filterOrders/<str:usernamefromclient>/<str:statusfromclient>/', filterOrders),
    
    # Dashboard Summary
    path('dashboardSummary/', getDashboardSummary),
    path('getMonthlySalesSummary/', getMonthlySalesSummary, name='getMonthlySalesSummary'),


    path('createRazorpayOrder/', create_razorpay_order),   # POST
    path('verifyPayment/', verify_payment),               # POST
    path('getOrderDetails/<int:order_id>/', get_order_details, name='get_order_details'),

    # Download invoice
    path('downloadInvoice/<int:order_id>/', download_invoice),

    





]

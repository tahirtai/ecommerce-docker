from django.contrib import admin
from .models import Cart, Order, UserData, Product
# Register your models here.
admin.site.register(UserData)
admin.site.register(Product)
admin.site.register(Cart)  # Registering the Cart model
admin.site.register(Order)  # Registering the Order model

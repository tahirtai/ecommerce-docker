from django.db import models

#  User table
class UserData(models.Model):
    username = models.CharField(max_length=20, primary_key=True)
    password = models.CharField(max_length=20)
    mobno = models.CharField(max_length=10)

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return f"username is {self.username}, role is {self.role}, mobno is {self.mobno}"

    class Meta:
        db_table = "userdata"


#  Product table
class Product(models.Model):
    product_id = models.IntegerField(primary_key=True)
    product_name = models.CharField(max_length=200)
    quantity = models.IntegerField()
    price = models.FloatField()
    image_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"Name: {self.product_name}, Price: {self.price}, Quantity: {self.quantity}"

    class Meta:
        db_table = "products"


#  Simple Number Input model
class NumberInput(models.Model):
    n1 = models.IntegerField()
    n2 = models.IntegerField()

    def __str__(self):
        return f"n1: {self.n1} + n2: {self.n2}"


#  Cart model
class Cart(models.Model):
    user = models.ForeignKey(UserData, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.user.username} - {self.product.product_name} ({self.quantity})"

    class Meta:
        db_table = "cart"


#  Order model (without product/quantity directly)
class Order(models.Model):
    user = models.ForeignKey(UserData, on_delete=models.CASCADE)
    total_price = models.FloatField(default=0.0)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Pending')  # Pending / Completed / Cancelled

    address = models.TextField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, default='COD')  # COD / Online

    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    payment_status = models.CharField(max_length=50, default='created')

    def __str__(self):
        return f"Order #{self.id} by {self.user.username} - Status: {self.status}"

    class Meta:
        db_table = "orders"



#  OrderItem model (multiple products per order)
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField(default=1)
    price_at_purchase = models.FloatField()  # snapshot of product price at time of purchase

    def get_subtotal(self):
        return self.price_at_purchase * self.quantity

    def __str__(self):
        return f"{self.product.product_name} x {self.quantity} for Order #{self.order.id}"

    class Meta:
        db_table = "order_items"

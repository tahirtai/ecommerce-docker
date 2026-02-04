from rest_framework import serializers
from .models import UserData, Product, Cart, Order, OrderItem

#  UserData serializer
class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ['username', 'password', 'mobno', 'role']


#  Product serializer
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['product_id', 'product_name', 'quantity', 'price', 'image_url']


#  Cart serializer
class CartSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    product_id = serializers.IntegerField(source='product.product_id', read_only=True)
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    price = serializers.FloatField(source='product.price', read_only=True)
    image_url = serializers.URLField(source='product.image_url', read_only=True)
    max_stock = serializers.IntegerField(source='product.quantity', read_only=True)

    class Meta:
        model = Cart
        fields = [
            'id',
            'username',
            'product_id',
            'product_name',
            'quantity',
            'price',
            'image_url',
            'max_stock'
        ]


#  New OrderItem serializer (nested inside order)
class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.product_id', read_only=True)
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    image_url = serializers.URLField(source='product.image_url', read_only=True)
    price = serializers.DecimalField(source='price_at_purchase', max_digits=10, decimal_places=2)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['product_id', 'product_name', 'quantity', 'price', 'image_url', 'subtotal']

    def get_subtotal(self, obj):
        return obj.price_at_purchase * obj.quantity



#  Updated Order serializer (with nested items)
class OrderSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)  # nested order items

    class Meta:
        model = Order
        fields = [
            'id',
            'username',
            'total_price',
            'order_date',
            'status',
            'address',          
            'payment_method',
            'razorpay_order_id',
            'razorpay_payment_id',
            'razorpay_signature',
            'payment_status',
            'items'
        ]

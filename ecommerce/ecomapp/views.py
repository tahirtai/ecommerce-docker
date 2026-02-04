import io
from tkinter import Canvas
from django.shortcuts import render
from django.http import HttpResponse
from django.db.models import Sum
from django.core.paginator import Paginator
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import razorpay
import hmac
import hashlib

from ecomapp.models import UserData, Product, Cart, Order, OrderItem
from ecomapp.serializers import UserDataSerializer, ProductSerializer, CartSerializer, OrderSerializer
from .forms import NumberInputForm


#  Home
def home(request):
    return render(request, 'home.html')


#  CONTACT page
def contact(request):
    answer = 0
    if request.method == 'POST':
        n1 = request.POST.get('n1')
        n2 = request.POST.get('n2')
        answer = int(n1) + int(n2)
    return render(request, 'contact.html', {'answer': answer})


#  FORM demo
def number_form_view(request):
    answer = None
    if request.method == 'POST':
        form = NumberInputForm(request.POST)
        if form.is_valid():
            n1 = form.cleaned_data['n1']
            n2 = form.cleaned_data['n2']
            answer = n1 + n2
    else:
        form = NumberInputForm()
    return render(request, 'form_template.html', {'form': form, 'answer': answer})


# ---------------------------
# 🧑‍💻 USER APIs
# ---------------------------

@api_view(['GET'])
def getUser(request):
    users = UserData.objects.all()
    data = [{'username': u.username, 'mobno': u.mobno, 'role': u.role} for u in users]
    return Response(data)


@api_view(['GET'])
def getUsername(request, username):
    try:
        user = UserData.objects.get(username=username)
        return Response({'username': user.username, 'password': user.password, 'mobno': user.mobno, 'role': user.role})
    except UserData.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


@api_view(['POST'])
def addUser(request):
    serializer = UserDataSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
def deleteUser(request, userfromclient):
    try:
        user = UserData.objects.filter(username=userfromclient)
        if user.exists():
            user.delete()
            return Response({'message': 'User deleted successfully'}, status=204)
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['PUT'])
def updateUser(request):
    try:
        data = request.data
        user = UserData.objects.get(username=data['username'])
        user.password = data['password']
        user.mobno = data['mobno']
        user.save()
        return Response({'message': 'User updated successfully'}, status=200)
    except UserData.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


@api_view(['PUT'])
def promoteUser(request):
    username = request.data.get('username')
    if not username:
        return Response({'error': 'Username is required'}, status=400)
    try:
        user = UserData.objects.get(username=username)
        user.role = 'admin'
        user.save()
        return Response({'message': 'User promoted to admin'}, status=200)
    except UserData.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


#  Login & Register
@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    try:
        user = UserData.objects.get(username=username)
        if user.password == password:
            return Response({'message': 'Login successful', 'username': user.username, 'role': user.role}, status=200)
        return Response({'error': 'Invalid password'}, status=401)
    except UserData.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


@api_view(['POST'])
def register(request):
    if UserData.objects.filter(username=request.data.get('username')).exists():
        return Response({'error': 'Username already exists'}, status=400)
    serializer = UserDataSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User registered successfully'}, status=201)
    return Response(serializer.errors, status=400)


# ---------------------------
# 📦 PRODUCT APIs
# ---------------------------

@api_view(['GET'])
def getAllProducts(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def getProductById(request, product_id):
    try:
        product = Product.objects.get(product_id=product_id)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)


@api_view(['POST'])
def addProduct(request):
    for item in request.data:
        Product.objects.create(
            product_id=item['product_id'],
            product_name=item['product_name'],
            quantity=item['quantity'],
            price=item['price'],
            image_url=item.get('image_url')
        )
    return Response({'message': 'Products added successfully'}, status=201)


@api_view(['PUT'])
def updateProduct(request):
    data = request.data
    try:
        product = Product.objects.get(product_id=data['product_id'])
        product.product_name = data['product_name']
        product.quantity = data['quantity']
        product.price = data['price']
        product.image_url = data.get('image_url')
        product.save()
        return Response({'message': 'Product updated successfully'}, status=200)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)


@api_view(['DELETE'])
def deleteProduct(request, product_id):
    product = Product.objects.filter(product_id=product_id)
    if product.exists():
        product.delete()
        return Response({'message': 'Product deleted'}, status=204)
    return Response({'error': 'Product not found'}, status=404)


@api_view(['GET'])
def get_max_product(request):
    product = Product.objects.order_by('-price').first()
    if product:
        return Response(ProductSerializer(product).data)
    return Response({'error': 'No products found'}, status=404)

@api_view(['GET'])
def get_min_product(request):
    product = Product.objects.order_by('price').first()
    if product:
        return Response(ProductSerializer(product).data)
    return Response({'error': 'No products found'}, status=404)

@api_view(['GET'])
def get_product_in(request, min, max):
    products = Product.objects.filter(price__gte=min, price__lte=max)
    return Response(ProductSerializer(products, many=True).data)

@api_view(['GET'])
def getProductByName(request, product_name):
    products = Product.objects.filter(product_name__icontains=product_name)
    return Response(ProductSerializer(products, many=True).data)



# ---------------------------
# 🛒 CART APIs
# ---------------------------

@api_view(['POST'])
def addToCart(request):
    try:
        user = UserData.objects.get(username=request.data['username'])
        product = Product.objects.get(product_id=request.data['product_id'])
        qty = int(request.data['quantity'])

        existing = Cart.objects.filter(user=user, product=product).first()
        if existing:
            existing.quantity = qty  
            existing.save()
            return Response({'message': 'Cart updated'}, status=200)
        else:
            Cart.objects.create(user=user, product=product, quantity=qty)
            return Response({'message': 'Product added to cart'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)



@api_view(['GET'])
def getCart(request, usernamefromclient):
    items = Cart.objects.filter(user__username=usernamefromclient)
    serializer = CartSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
def updateCartQuantity(request):
    data = request.data
    cart_item = Cart.objects.filter(user__username=data['username'], product__product_id=data['product_id']).first()
    if cart_item:
        cart_item.quantity = data['new_quantity']
        cart_item.save()
        return Response({'message': 'Quantity updated'}, status=200)
    return Response({'error': 'Item not found'}, status=404)


@api_view(['DELETE'])
def removeCartItem(request, usernamefromclient, product_id_from_client):
    item = Cart.objects.filter(user__username=usernamefromclient, product__product_id=product_id_from_client)
    if item.exists():
        item.delete()
        return Response({'message': 'Item removed'}, status=204)
    return Response({'error': 'Item not found'}, status=404)


@api_view(['GET'])
def getCartTotal(request, usernamefromclient):
    items = Cart.objects.filter(user__username=usernamefromclient)
    total_price = sum(i.product.price * i.quantity for i in items)
    return Response({'total_price': total_price})


# ---------------------------
# 📦 ORDER APIs (with OrderItem)
# ---------------------------

# @api_view(['POST'])
# def placeOrder(request):
#     try:
#         username = request.data.get('username')
#         address = request.data.get('address', '').strip()
#         payment_method = request.data.get('paymentMethod', 'COD')  # COD or Online

#         #  Validate user
#         try:
#             user = UserData.objects.get(username=username)
#         except UserData.DoesNotExist:
#             return Response({'error': 'User not found'}, status=404)

#         #  Validate cart
#         cart_items = Cart.objects.filter(user=user)
#         if not cart_items.exists():
#             return Response({'error': 'Cart is empty'}, status=400)

#         if not address:
#             return Response({'error': 'Address is required'}, status=400)

#         #  Calculate total price
#         total_price = sum(item.product.price * item.quantity for item in cart_items)

#         #  If payment method is ONLINE, create Razorpay order first
#         if payment_method.lower() == "online":
#             # Create Razorpay order (amount in paise)
#             razorpay_order = razorpay_client.order.create({
#                 'amount': int(total_price * 100),  # convert to paise
#                 'currency': 'INR',
#                 'payment_capture': 1
#             })

#             # Create order in DB with status pending
#             order = Order.objects.create(
#                 user=user,
#                 total_price=total_price,
#                 status='Pending',
#                 address=address,
#                 payment_method='Online',
#                 razorpay_order_id=razorpay_order['id'],
#                 payment_status='created'
#             )

#             # Save order items but don't deduct stock until payment is verified
#             for item in cart_items:
#                 OrderItem.objects.create(
#                     order=order,
#                     product=item.product,
#                     quantity=item.quantity,
#                     price_at_purchase=item.product.price
#                 )

#             # Return Razorpay details
#             return Response({
#                 'message': 'Razorpay order created',
#                 'order_id': order.id,
#                 'razorpay_order_id': razorpay_order['id'],
#                 'key_id': RAZORPAY_KEY_ID,
#                 'amount': total_price
#             }, status=201)

#         #  If payment method is COD
#         else:
#             # Create order in DB
#             order = Order.objects.create(
#                 user=user,
#                 total_price=0.0,
#                 status='Pending',
#                 address=address,
#                 payment_method='COD',
#                 payment_status='cod'
#             )

#             for item in cart_items:
#                 OrderItem.objects.create(
#                     order=order,
#                     product=item.product,
#                     quantity=item.quantity,
#                     price_at_purchase=item.product.price
#                 )
#                 total_price += item.product.price * item.quantity
#                 # Decrease stock immediately for COD
#                 item.product.quantity -= item.quantity
#                 item.product.save()

#             order.total_price = total_price
#             order.save()
#             cart_items.delete()

#             return Response({
#                 'message': 'COD Order placed successfully',
#                 'order_id': order.id,
#                 'address': order.address,
#                 'payment_method': order.payment_method
#             }, status=201)

#     except Exception as e:
#         return Response({'error': str(e)}, status=500)



# @api_view(['GET'])
# def getOrders(request, usernamefromclient):
#     try:
#         user = UserData.objects.get(username=usernamefromclient)
#         orders = Order.objects.filter(user=user).order_by('-order_date')
#         order_list = []

#         for order in orders:
#             # fetch order items
#             items = OrderItem.objects.filter(order=order)
#             item_details = []
#             for item in items:
#                 item_details.append({
#                     'product_name': item.product.product_name,
#                     'price': item.price_at_purchase,
#                     'quantity': item.quantity,
#                     'subtotal': item.get_subtotal(),
#                     'image_url': item.product.image_url
#                 })

#             order_list.append({
#                 'id': order.id,
#                 'total_price': order.total_price,
#                 'order_date': order.order_date,
#                 'status': order.status,
#                 'items': item_details
#             })

#         return Response(order_list)
#     except UserData.DoesNotExist:
#         return Response({'error': 'User not found'}, status=404)



@api_view(['PATCH'])
def cancelOrder(request):
    try:
        order = Order.objects.get(id=request.data.get('order_id'), user__username=request.data.get('username'))
        if order.status != 'Pending':
            return Response({'error': 'Cannot cancel processed order'}, status=400)
        order.status = 'Cancelled'
        order.save()
        return Response({'message': 'Order cancelled'}, status=200)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)


@api_view(['PATCH'])
def completeOrder(request):
    try:
        admin_user = UserData.objects.get(username=request.data.get('admin_username'), role='admin')
        order = Order.objects.get(id=request.data.get('order_id'))
        if order.status != 'Pending':
            return Response({'error': 'Order already processed'}, status=400)
        order.status = 'Completed'
        order.save()
        return Response({'message': 'Order completed'}, status=200)
    except UserData.DoesNotExist:
        return Response({'error': 'Not authorized'}, status=403)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)


@api_view(['DELETE'])
def deleteOrder(request, order_id):
    try:
        UserData.objects.get(username=request.query_params.get('admin_username'), role='admin')
        order = Order.objects.get(id=order_id)
        order.delete()
        return Response({'message': 'Order deleted'}, status=204)
    except UserData.DoesNotExist:
        return Response({'error': 'Not authorized'}, status=403)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)


@api_view(['GET'])
def filterOrders(request, usernamefromclient, statusfromclient):
    search_query = request.GET.get('search', '')
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))

    if usernamefromclient == 'all':
        orders = Order.objects.filter(status=statusfromclient).order_by('-order_date')
    else:
        orders = Order.objects.filter(user__username=usernamefromclient, status=statusfromclient).order_by('-order_date')

    # search by product name (via items)
    if search_query:
        orders = orders.filter(items__product__product_name__icontains=search_query).distinct()

    paginator = Paginator(orders, page_size)
    serializer = OrderSerializer(paginator.get_page(page), many=True)

    return Response({
        'total_orders': paginator.count,
        'total_pages': paginator.num_pages,
        'current_page': page,
        'orders': serializer.data
    })


@api_view(['GET'])
def getDashboardSummary(request):
    return Response({
        'total_orders': Order.objects.count(),
        'total_users': UserData.objects.count(),
        'total_sales': Order.objects.filter(status='Completed').aggregate(total=Sum('total_price'))['total'] or 0,
        'pending_orders': Order.objects.filter(status='Pending').count(),
        'completed_orders': Order.objects.filter(status='Completed').count(),
        'cancelled_orders': Order.objects.filter(status='Cancelled').count(),
    })


@api_view(['GET'])
def getMonthlySalesSummary(request):
    from django.db.models.functions import TruncMonth
    from django.db.models import Count
    data = (Order.objects.filter(status='Completed')
            .annotate(month=TruncMonth('order_date'))
            .values('month')
            .annotate(total_sales=Sum('total_price'), order_count=Count('id'))
            .order_by('month'))
    result = [{'month': d['month'].strftime('%B %Y'), 'total_sales': float(d['total_sales']), 'order_count': d['order_count']} for d in data]
    return Response(result)


# ---------------------------
# 💳 RAZORPAY APIs
# ---------------------------

RAZORPAY_KEY_ID = settings.RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET = settings.RAZORPAY_KEY_SECRET
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
razorpay_client.set_app_details({"title": "DjangoEcomApp", "version": "1.0"})


@api_view(['POST'])
def create_razorpay_order(request):
    try:
        amount = int(request.data.get('amount', 0))
        username = request.data.get('username')
        if amount <= 0:
            return Response({'error': 'Invalid amount'}, status=400)
        order_data = razorpay_client.order.create({'amount': amount * 100, 'currency': 'INR', 'payment_capture': 1})
        user = UserData.objects.get(username=username)
        order = Order.objects.create(user=user, total_price=amount, status='Pending', razorpay_order_id=order_data['id'], payment_status='created')
        return Response({'order_id': order_data['id'], 'key_id': RAZORPAY_KEY_ID, 'order_db_id': order.id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# @api_view(['POST'])
# def verify_payment(request):
#     try:
#         razorpay_order_id = request.data.get('razorpay_order_id')
#         razorpay_payment_id = request.data.get('razorpay_payment_id')
#         razorpay_signature = request.data.get('razorpay_signature')

#         # Generate expected signature for verification
#         generated_signature = hmac.new(
#             bytes(RAZORPAY_KEY_SECRET, 'utf-8'),
#             bytes(f"{razorpay_order_id}|{razorpay_payment_id}", 'utf-8'),
#             hashlib.sha256
#         ).hexdigest()

#         if generated_signature == razorpay_signature:
#             # Payment is verified
#             order = Order.objects.get(razorpay_order_id=razorpay_order_id)
#             order.razorpay_payment_id = razorpay_payment_id
#             order.razorpay_signature = razorpay_signature
#             order.payment_status = 'Paid'         #  Mark as paid
#             order.status = 'Completed'            #  Optional: mark as completed
#             order.save()

#             return Response({'message': 'Payment verified', 'order_id': order.id}, status=200)

#         return Response({'error': 'Invalid signature'}, status=400)

#     except Exception as e:
#         return Response({'error': str(e)}, status=500)



@api_view(['GET'])
def get_order_details(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        return Response({
            "order_id": order.id,
            "amount": order.total_price,
            "status": order.status,
            "payment_status": order.payment_status,
            "razorpay_order_id": order.razorpay_order_id
        })
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)





@api_view(['POST'])
def verify_payment(request):
    try:
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
            return Response({'error': 'Missing payment info'}, status=400)

        # Generate expected signature for verification
        generated_signature = hmac.new(
            bytes(RAZORPAY_KEY_SECRET, 'utf-8'),
            bytes(f"{razorpay_order_id}|{razorpay_payment_id}", 'utf-8'),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != razorpay_signature:
            return Response({'error': 'Invalid signature'}, status=400)

        # Payment is verified
        try:
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found for this Razorpay ID'}, status=404)

        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature
        order.payment_status = 'Paid'
        order.status = 'Completed'
        order.save()

        return Response({'message': 'Payment verified', 'order_id': order.id}, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=500)



@api_view(['GET'])
def getOrders(request, usernamefromclient):
    try:
        user = UserData.objects.get(username=usernamefromclient)
        orders = Order.objects.filter(user=user).order_by('-order_date')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    except UserData.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)






import io
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import Color, black, white
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Order

@api_view(['GET'])
def download_invoice(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        items = order.items.all()

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 60  # Start from top

        # ✅ Light Watermark: Center of page in large light grey text
        p.saveState()
        p.setFont("Helvetica-Bold", 60)
        p.setFillColor(Color(0.9, 0.9, 0.9, alpha=0.1))  # Light grey with transparency
        p.drawCentredString(width / 2, height / 2 + 30, "BUYBLOX")
        p.restoreState()

        # 🏢 1. Company Name (centered)
        p.setFont("Helvetica-Bold", 20)
        p.setFillColor(black)
        p.drawCentredString(width / 2, y, "BUYBLOX®")
        y -= 25
        p.setFont("Helvetica", 12)
        p.drawCentredString(width / 2, y, "Luxury Clothing Store")
        y -= 40

        # 🧾 2. Invoice Header
        p.setFont("Helvetica-Bold", 16)
        p.drawCentredString(width / 2, y, f"Invoice for Order #{order.id}")
        y -= 30

        p.setFont("Helvetica", 12)
        p.drawCentredString(width / 2, y, f"Date: {order.order_date.strftime('%d %b %Y')}")
        y -= 20
        p.drawCentredString(width / 2, y, f"Customer: {order.user.username}")
        y -= 30

        # 📦 3. Shipping Address (optional)
        if hasattr(order, 'shipping_address') and order.shipping_address:
            p.setFont("Helvetica-Oblique", 11)
            p.drawCentredString(width / 2, y, f"Shipping Address: {order.shipping_address}")
            y -= 30

        # 🛒 4. Items Section
        p.setFont("Helvetica-Bold", 13)
        p.drawCentredString(width / 2, y, "Items")
        y -= 25

        total = 0
        for item in items:
            line_total = item.price_at_purchase * item.quantity
            total += line_total
            line = f"{item.product.product_name}  -  ₹{item.price_at_purchase} x {item.quantity}  =  ₹{line_total}"
            p.setFont("Helvetica", 11)
            p.drawCentredString(width / 2, y, line)
            y -= 20

        # 💰 5. Total + Payment Info
        y -= 15
        p.setFont("Helvetica-Bold", 12)
        p.drawCentredString(width / 2, y, f"Total Amount: ₹{total}")
        y -= 25

        p.setFont("Helvetica", 12)
        p.drawCentredString(width / 2, y, f"Payment Method: {order.payment_method}")
        y -= 20
        p.drawCentredString(width / 2, y, f"Payment Status: {order.payment_status}")
        y -= 40

        # ❤️ 6. Footer
        p.setFont("Helvetica-Oblique", 10)
        p.drawCentredString(width / 2, 60, "Thank you for shopping with BuyBlox!")
        p.drawCentredString(width / 2, 45, "www.buyblox.in   |   contact@buyblox.in   |   24/7 Support")

        p.showPage()
        p.save()
        buffer.seek(0)

        return HttpResponse(buffer, content_type='application/pdf')

    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)





@api_view(['POST'])
def placeOrder(request):
    try:
        username = request.data.get('username')
        address = request.data.get('address', '').strip()
        payment_method = request.data.get('paymentMethod', 'COD')  # COD or Online

        #  Validate user
        try:
            user = UserData.objects.get(username=username)
        except UserData.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        #  Validate cart
        cart_items = Cart.objects.filter(user=user)
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=400)

        if not address:
            return Response({'error': 'Address is required'}, status=400)

        #  Calculate total price
        total_price = sum(item.product.price * item.quantity for item in cart_items)

        #  If payment method is ONLINE, create Razorpay order first
        if payment_method.lower() == "online":
            # Create Razorpay order (amount in paise)
            razorpay_order = razorpay_client.order.create({
                'amount': int(total_price * 100),  # convert to paise
                'currency': 'INR',
                'payment_capture': 1
            })

            # Create order in DB with status pending
            order = Order.objects.create(
                user=user,
                total_price=total_price,
                status='Pending',
                address=address,
                payment_method='Online',
                razorpay_order_id=razorpay_order['id'],
                payment_status='created'
            )

            # Save order items but don't deduct stock until payment is verified
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price_at_purchase=item.product.price
                )

            # Return Razorpay details
            return Response({
                'message': 'Razorpay order created',
                'order_id': order.id,
                'razorpay_order_id': razorpay_order['id'],
                'key_id': RAZORPAY_KEY_ID,
                'amount': total_price
            }, status=201)

        #  If payment method is COD
        else:
            # Create order in DB (initial total is 0.0)
            order = Order.objects.create(
                user=user,
                total_price=0.0,
                status='Pending',
                address=address,
                payment_method='COD',
                payment_status='cod'
            )

            # Create OrderItems and update product stock
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price_at_purchase=item.product.price
                )
                item.product.quantity -= item.quantity
                item.product.save()

            # ✅ Recalculate total from saved OrderItems for accuracy
            accurate_total = sum(oi.price_at_purchase * oi.quantity for oi in order.items.all())
            order.total_price = accurate_total
            order.save()

            # Clear cart
            cart_items.delete()

            return Response({
                'message': 'COD Order placed successfully',
                'order_id': order.id,
                'address': order.address,
                'payment_method': order.payment_method
            }, status=201)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

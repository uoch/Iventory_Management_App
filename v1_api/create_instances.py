from django.utils import timezone
from decimal import Decimal
from datetime import date
from django.contrib.auth import get_user_model
from LittleLemonAPI.models import Store, User, Category, Product, Inventory, StockTransaction

def create_instances():
    # Create a store
    User = get_user_model()
    store = Store.objects.create(name='My Store', location='New York')

    # Create users
    User.objects.create_user(username='mana4', password='Messi@30', role='manager', store=store)
    User.objects.create_user(username='rece5', password='Messi@30', role='receiver', store=store)
    User.objects.create_user(username='ret7', password='Messi@30', role='retriever', store=store)

    # Create categories
    category1 = Category.objects.create(name='Electronics')
    category2 = Category.objects.create(name='Clothing')

    # Create products
    product1 = Product.objects.create(
        name='Laptop',
        location_in_store='A1',
        description='Powerful laptop with advanced features',
        price=Decimal('1499.99'),
        category=category1,
        store=store
    )

    product2 = Product.objects.create(
        name='T-Shirt',
        location_in_store='B2',
        description='Casual cotton t-shirt',
        price=Decimal('19.99'),
        category=category2,
        store=store
    )

    # Create inventory items
    inventory1 = Inventory.objects.create(
        product=product1,
        available_quantity=10,
        date_received=date(2023, 1, 15),
        expiration_date=date(2024, 1, 15),
        store=store
    )

    inventory2 = Inventory.objects.create(
        product=product2,
        available_quantity=50,
        date_received=date(2023, 2, 20),
        expiration_date=date(2024, 2, 20),
        store=store
    )

    # Create stock transactions
    User = get_user_model()
    manager = User.objects.get(username='manager1')

    StockTransaction.objects.create(
        product=product1,
        quantity=5,
        date=timezone.now(),
        user=manager,
        operation_type=StockTransaction.RETRIEVAL
    )

    StockTransaction.objects.create(
        product=product2,
        quantity=20,
        date=timezone.now(),
        user=manager,
        operation_type=StockTransaction.RETRIEVAL
    )

    # Print the created instances
    print('Store:', store)
    print('Users:', User.objects.all())
    print('Categories:', Category.objects.all())
    print('Products:', Product.objects.all())
    print('Inventory Items:', Inventory.objects.all())
    print('Stock Transactions:', StockTransaction.objects.all())

# Call the function to create instances
create_instances()

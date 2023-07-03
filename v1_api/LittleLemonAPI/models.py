from django.db import models
from django.db.models import Avg, Sum
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from rest_framework.authtoken.models import Token as AuthToken
from django.db.models import F
from django.db.models import OuterRef,Subquery




class Store(models.Model):
    name = models.CharField(max_length=100, default='first-store')

    def __str__(self):
        return self.name


class User(AbstractUser):
    ROLES = [
        ('manager', 'Manager'),
        ('receiver', 'Receiver'),
        ('retriever', 'Retriever'),
    ]
    role = models.CharField(max_length=32, choices=ROLES)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, default=1)
    custom_auth_token = models.ForeignKey(AuthToken, on_delete=models.CASCADE, related_name='custom_user', null=True,
                                          blank=True)

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='custom_user_set',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='custom_user_set',
        related_query_name='user',
    )


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=100)
    location_in_store = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    store = models.ForeignKey(Store, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    def get_location(self):
        return self.location_in_store
class SalesOrderLine(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    # Add other fields as necessary

    def __str__(self):
        return f"Sales Order Line {self.pk}"


class Inventory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_items')
    available_quantity = models.IntegerField()
    date_received = models.DateField()
    expiration_date = models.DateField()
    date_retrieved = models.DateTimeField(null=True, blank=True, default=None)
    store = models.ForeignKey(Store, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.product} - Quantity: {self.available_quantity}'
    
    @classmethod
    def calculate_total_products(cls):
        return cls.objects.values('product').distinct().count()
    @classmethod
    def calculate_total_inventory(cls):
        return cls.objects.aggregate(total_inventory=Sum('available_quantity'))['total_inventory']

    @classmethod
    def calculate_average_quantity(cls):
        return cls.objects.aggregate(avg_quantity=Avg('available_quantity'))['avg_quantity']


    @classmethod
    def calculate_average_quantity(cls):
        return cls.objects.aggregate(avg_quantity=Avg('available_quantity'))['avg_quantity']



    @classmethod
    def calculate_low_stock_items(cls, threshold):
        return cls.objects.filter(available_quantity__lt=threshold).count()







    @classmethod
    def calculate_out_of_stock_items(cls):
        return cls.objects.filter(available_quantity=0).count()


    @classmethod
    def calculate_average_inventory_value(cls):
        return cls.objects.aggregate(average_value=Avg('product__price')).get('average_value', 0)





    @staticmethod
    def calculate_inventory_turnover():
        total_sold_quantity_subquery = SalesOrderLine.objects.filter(
            product_id=OuterRef('product_id')
        ).values('product_id').annotate(total_sold=Sum('quantity')).values('total_sold')[:1]

        total_sold_quantity = Inventory.objects.annotate(
            avg_sold=Subquery(total_sold_quantity_subquery)
        ).values('avg_sold').first()

        average_inventory = Inventory.objects.aggregate(
            avg_inventory=Avg('available_quantity')
        )['avg_inventory']

        try:
            inventory_turnover = total_sold_quantity['avg_sold'] / average_inventory
        except (TypeError, ZeroDivisionError):
            inventory_turnover = 0

        return inventory_turnover if inventory_turnover is not None else 0





class GlobalKPI(models.Model):
    total_inventory = models.IntegerField(default=0)
    total_products = models.IntegerField(default = 0)
    average_quantity = models.FloatField(default=0)
    low_stock_items = models.IntegerField(default=0)  # Add default value here
    out_of_stock_items = models.IntegerField(default=0)
    average_inventory_value = models.DecimalField(null=True, max_digits=10, decimal_places=2)

    inventory_turnover = models.DecimalField(null=True, max_digits=10, decimal_places=2)


    @classmethod
    def update_global_kpi(cls):
        total_inventory = Inventory.calculate_total_inventory()
        total_products = Inventory.calculate_total_products()
        average_quantity = Inventory.calculate_average_quantity()
        low_stock_items = Inventory.calculate_low_stock_items(settings.LOW_STOCK_THRESHOLD)
        out_of_stock_items = Inventory.calculate_out_of_stock_items()
        average_inventory_value = Inventory.calculate_average_inventory_value()
        inventory_turnover = Inventory.calculate_inventory_turnover()

        global_kpi, created = GlobalKPI.objects.get_or_create(pk=1)
        global_kpi.total_inventory = total_inventory if total_inventory else 0
        global_kpi.total_products = total_products
        global_kpi.average_quantity = average_quantity if average_quantity else 0
        global_kpi.low_stock_items = low_stock_items if low_stock_items else 0
        global_kpi.out_of_stock_items = out_of_stock_items
        global_kpi.average_inventory_value = average_inventory_value
        global_kpi.inventory_turnover = inventory_turnover
        global_kpi.save()


class StoreKPI(models.Model):
    store = models.OneToOneField(Store, on_delete=models.CASCADE)
    total_inventory = models.IntegerField(default=0)
    total_products = models.IntegerField(default=0)
    average_quantity = models.FloatField(default=0)
    low_stock_items = models.IntegerField(default=0)
    out_of_stock_items = models.IntegerField(default=0)
    average_inventory_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00  # Provide a default value or set it explicitly
    )


    @classmethod
    def update_store_kpis(cls):
        stores = Store.objects.all()
        for store in stores:
            total_inventory = Inventory.objects.filter(store=store).aggregate(
                total_inventory=Sum('available_quantity'))['total_inventory'] or 0
            total_products = Inventory.objects.filter(store=store).values('product').distinct().count()
            average_quantity = Inventory.objects.filter(store=store).aggregate(
                avg_quantity=Avg('available_quantity'))['avg_quantity'] or 0
            low_stock_items = Inventory.objects.filter(store=store,
                                                    available_quantity__lt=settings.LOW_STOCK_THRESHOLD).count()
            out_of_stock_items = Inventory.objects.filter(store=store, available_quantity=0).count()
            average_inventory_value = Inventory.objects.filter(store=store).annotate(
                total_value=F('available_quantity') * F('product__price')).aggregate(
                avg_value=Avg('total_value'))['avg_value']

            if average_inventory_value is None:
                average_inventory_value = 0.00

            store_kpi, created = cls.objects.get_or_create(store=store)
            store_kpi.total_inventory = total_inventory
            store_kpi.total_products = total_products
            store_kpi.average_quantity = average_quantity
            store_kpi.low_stock_items = low_stock_items
            store_kpi.out_of_stock_items = out_of_stock_items
            store_kpi.average_inventory_value = average_inventory_value
            store_kpi.save()



class StockTransaction(models.Model):
    ENTRY = 'ENTRY'
    RETRIEVAL = 'RETRIEVAL'
    OPERATION_CHOICES = [
        (ENTRY, 'Stock Entry'),
        (RETRIEVAL, 'Stock Retrieval'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    date = models.DateField(default=timezone.now)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    operation_type = models.CharField(max_length=10, choices=OPERATION_CHOICES)

    def __str__(self):
        operation = 'Stock Entry' if self.operation_type == self.ENTRY else 'Stock Retrieval'
        return f'{self.product} - Quantity: {self.quantity} - Operation: {operation}'

from django.contrib import admin
from LittleLemonAPI.models import StockTransaction, Product, Inventory, Category

admin.site.register(StockTransaction)
admin.site.register(Product)
admin.site.register(Inventory)
admin.site.register(Category)


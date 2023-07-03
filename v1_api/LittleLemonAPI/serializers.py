from rest_framework import serializers
from .models import User, Category, Store, Product, Inventory, StockTransaction, GlobalKPI, StoreKPI,Store
from djoser.serializers import UserCreateSerializer
from rest_framework import serializers
from djoser.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()

class StoreSerializer(serializers.Serializer):
    store_id = serializers.IntegerField(source='id')
    store_name = serializers.CharField(source='name')

class CustomUserListSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='get_role_display')
    store = StoreSerializer()

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'role', 'store')

class CustomUserCreateSerializer(UserCreateSerializer):
    role = serializers.ChoiceField(choices=[
        ('manager', 'Manager'),
        ('receiver', 'Receiver'),
        ('retriever', 'Retriever')
    ], read_only=False)
    store = serializers.PrimaryKeyRelatedField(queryset=Store.objects.all())

    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('email', 'username', 'password', 'role', 'store')

    def create(self, validated_data):
        role = validated_data.pop('role')
        store = validated_data.pop('store', None)

        if not store:
            raise serializers.ValidationError({'store': 'Store is required.'})

        user = User.objects.create_user(**validated_data)
        user.role = role
        user.store = store
        user.save()
        return user

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['role'] = instance.get_role_display()
        representation['store'] = StoreSerializer(instance.store).data
        return representation



class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']





class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    quantity = serializers.SerializerMethodField()

    def get_quantity(self, product):
        inventory = Inventory.objects.filter(product=product).first()
        if inventory:
            return inventory.available_quantity
        return None

    class Meta:
        model = Product
        fields = ['id', 'name', 'location_in_store', 'description', 'price', 'category', 'quantity']



class InventorySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    store = serializers.PrimaryKeyRelatedField(queryset=Store.objects.all())

    class Meta:
        model = Inventory
        fields = ['id', 'product', 'available_quantity', 'date_received', 'expiration_date', 'date_retrieved', 'store']


class StockTransactionSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = StockTransaction
        fields = ['id', 'product', 'quantity', 'date', 'user', 'operation_type']


class GlobalKPISerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalKPI
        fields = '__all__'


class StoreKPISerializer(serializers.ModelSerializer):
    store = serializers.StringRelatedField()

    class Meta:
        model = StoreKPI
        fields = '__all__'

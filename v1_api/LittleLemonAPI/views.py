from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework import status
from .serializers import (
    InventorySerializer,
    ProductSerializer,
    CustomUserCreateSerializer,
    StoreSerializer,
    GlobalKPISerializer,
    StoreKPISerializer,
)
from .models import Inventory, Product, Store, GlobalKPI, StoreKPI,User
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.generics import ListAPIView
from djoser.views import TokenCreateView
from django.contrib.auth import login
from LittleLemonAPI.models import User




class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = CustomUserCreateSerializer
    
    def post(self, request):
        serializer = CustomUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response_data = {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'role': user.role,
                'store': user.store.name if user.store else None
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenCreateView(TokenCreateView):
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        role = ["Manager", "Receiver", "Retriever"]

        # Check user role and store
        if user.role in role and user.store:
            self.login_user(request, user)
            return Response({'token': serializer.data['auth_token']}, status=status.HTTP_200_OK)

        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    def login_user(self, request, user):
        # Perform login using Django's login method
        login(request, user)


class KPIsAPIView(APIView):

    def get(self, request):
        global_kpis = GlobalKPI.objects.all()
        serializer = GlobalKPISerializer(global_kpis, many=True)
        return Response(serializer.data)

class StoreKPIsAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        store_kpis = StoreKPI.objects.all()
        serializer = StoreKPISerializer(store_kpis, many=True)
        return Response(serializer.data)

class StoreAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        stores = Store.objects.all()
        serializer = StoreSerializer(stores, many=True)
        return Response(serializer.data)

class InventoryListAPIView(APIView):
    def get(self, request):
        inventory = Inventory.objects.all()
        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
@api_view(['POST'])
def enter_goods(request):
    #if request.user.role == 'receiver':
        store_id = request.data.get('store')
        if not store_id:
            return Response("Store is required.", status=status.HTTP_400_BAD_REQUEST)

        store = Store.objects.filter(id=store_id).first()
        if not store:
            return Response("Invalid store.", status=status.HTTP_404_NOT_FOUND)

        product_data = request.data.get('product')
        serializer = ProductSerializer(data=product_data)
        if serializer.is_valid():
            product = serializer.save()
            inventory_data = {
                'product': product.id,
                'available_quantity': request.data.get('available_quantity'),
                'date_received': request.data.get('date_received'),
                'expiration_date': request.data.get('expiration_date'),
                'store': store.id
            }
            inventory_serializer = InventorySerializer(data=inventory_data)
            if inventory_serializer.is_valid():
                inventory = inventory_serializer.save()
                return Response({
                    'product': ProductSerializer(product).data,
                    'inventory': InventorySerializer(inventory).data
                }, status=status.HTTP_201_CREATED)
            else:
                # Delete the newly created product if inventory creation fails
                product.delete()
                return Response(inventory_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    #return Response("Not authorized...", status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'POST'])
def retrieve_goods(request):
    if request.method == 'GET':
        store_id = request.query_params.get('store')
        if not store_id:
            return Response("Store is required.", status=status.HTTP_400_BAD_REQUEST)

        store = Store.objects.filter(id=store_id).first()
        if not store:
            return Response("Invalid store.", status=status.HTTP_404_NOT_FOUND)

        products = Product.objects.filter(store=store)
        serializer = ProductSerializer(products, many=True)

        return Response(serializer.data)
    elif request.method == 'POST':
        if request.user.role == 'retriever':
            store_id = request.data.get('store')
            if not store_id:
                return Response("Store is required.", status=status.HTTP_400_BAD_REQUEST)

            store = Store.objects.filter(id=store_id).first()
            if not store:
                return Response("Invalid store.", status=status.HTTP_404_NOT_FOUND)

            selected_product_ids = request.data.get('selectedProducts', [])
            products = Product.objects.filter(store=store, id__in=selected_product_ids)
            serializer = ProductSerializer(products, many=True)
            if products:
                products.delete()
                return Response(serializer.data)
            else:
                return Response("No products found", status=status.HTTP_404_NOT_FOUND)
        else:
            return Response("Not authorized to view this page", status=status.HTTP_401_UNAUTHORIZED)
class ShippingView(APIView):
    def put(self, request):
        selected_goods = request.data  # Assuming the selected goods are sent in the request body as a list of objects

        # Perform the shipping logic using the selected goods
        # For example, you can create StockTransaction objects to represent the shipped goods
        for selected_good in selected_goods:
            product_id = selected_good['id']
            quantity = selected_good['quantity']
            
            # Create a StockTransaction object for each selected good
            stock_transaction = StockTransaction(product_id=product_id, quantity=quantity, user=request.user, operation_type='RETRIEVAL')
            stock_transaction.save()

        return Response(status=status.HTTP_200_OK)
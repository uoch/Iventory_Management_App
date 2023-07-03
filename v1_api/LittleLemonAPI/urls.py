from django.urls import path
from . import views

urlpatterns = [
    path('auth/users/', views.UserListView.as_view(), name='user-list'),
    path('auth/token/login/', views.CustomTokenCreateView.as_view(), name='token_create'),

    path('kpis/', views.KPIsAPIView.as_view(), name='kpis'),
    path('store-kpis/', views.StoreKPIsAPIView.as_view(), name='store-kpis'),
    path('stores/', views.StoreAPIView.as_view(), name='stores'),
    path('inventory/', views.InventoryListAPIView.as_view(), name='inventory'),
    path('enter-goods/', views.enter_goods, name='enter-goods'),
    path('retrieve-goods/', views.retrieve_goods, name='retrieve-goods'),
    path('shipping/', views.ShippingView.as_view(), name='shipping'),
]
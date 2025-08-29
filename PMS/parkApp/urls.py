from django.urls import path
from . import views
from .views import OrganizationListCreateAPI, ParkingSlotListCreateAPI

urlpatterns = [
    path('', views.home, name='home'),
    path('book_slot/', views.book_slot, name='book_slot'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('checkout/', views.checkout, name='checkout'),

    # API Endpoints
    path("api/organizations/", OrganizationListCreateAPI.as_view(), name="organization-list-create"),
    path("api/slots/", ParkingSlotListCreateAPI.as_view(), name="slot-list-create"),
]

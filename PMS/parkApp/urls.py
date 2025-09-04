from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('', views.home, name='home'),
    path('book_slot/', views.book_slot, name='book_slot'),
    path('booking_success/', views.booking_success, name='booking_success'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'), 
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    path('register/', views.register, name='register'),
    path('checkout/', views.checkout, name='checkout'),
    path('org_dashboard/',views.org_dashboard,name='org_dashboard'),
    path('admin_dashboard/',views.admin_dashboard,name= 'admin_dashboard'),
    # API Endpoints
    path('api/bookings/', BookingCreateAPI.as_view(), name='api_bookings'),
    path("api/organizations/", OrganizationListCreateAPI.as_view(), name="organization-list-create"),
    path("api/slots/", ParkingSlotListCreateAPI.as_view(), name="slot-list-create"),
    
     # ---------------- New APIs for Dashboard ----------------
    path('api/org-dashboard-stats/', OrgDashboardStatsAPI.as_view(), name='org-dashboard-stats'),
    path('api/org-slots/', OrgSlotsAPI.as_view(), name='org-slots'),
    path('api/org-bookings/', OrgBookingsAPI.as_view(), name='org-bookings'),
]

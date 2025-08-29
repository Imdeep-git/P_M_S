from django.shortcuts import render
from rest_framework import generics
from .models import Organization, ParkingSlot
from .serializers import OrganizationSerializer, ParkingSlotSerializer

# Template Views
def home(request):
    return render(request, "index.html")

def book_slot(request):
    return render(request, "book_slot.html")

def about(request):
    return render(request, "about.html")

def contact(request):
    return render(request, "contact.html")

def login(request):
    return render(request, "login.html")

def register(request):
    return render(request, "register_org.html")

def checkout(request):
    return render(request, 'checkout.html')


# API Views
class OrganizationListCreateAPI(generics.ListCreateAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer


class ParkingSlotListCreateAPI(generics.ListCreateAPIView):
    queryset = ParkingSlot.objects.all()
    serializer_class = ParkingSlotSerializer

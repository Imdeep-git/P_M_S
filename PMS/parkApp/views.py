from django.shortcuts import render
from rest_framework import generics
from .models import Organization, ParkingSlot,Booking
from .serializers import OrganizationSerializer, ParkingSlotSerializer,BookingSerializer
from rest_framework.response import Response
from rest_framework import status
import random, string
from django.utils import timezone
import qrcode
import base64
from io import BytesIO
from datetime import datetime

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


def checkout(request):
    return render(request, 'checkout.html')

def org_dashboard(request):
    return render(request, 'org_dashboard.html')

def admin_dashboard(request):
    return render(request, "admin_dashboard.html")

from django.shortcuts import render, redirect
from .models import Organization
from django.contrib import messages
from django.contrib.auth.hashers import make_password

def register(request):
    if request.method == "POST":
        # Get data from the form
        name = request.POST.get('name')
        org_type = request.POST.get('org_type')
        description = request.POST.get('description', '')
        total_slots_2w = int(request.POST.get('total_slots_2w') or 0)
        total_slots_4w = int(request.POST.get('total_slots_4w') or 0)
        address = request.POST.get('address')
        city = request.POST.get('city')
        state = request.POST.get('state')
        zip_code = request.POST.get('zip_code')
        contact_person = request.POST.get('contact_person')
        contact_phone = request.POST.get('contact_phone')
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Hash the password before saving
        hashed_password = make_password(password)

        # Save to database
        Organization.objects.create(
            name=name,
            org_type=org_type,
            description=description,
            total_slots_2w=total_slots_2w,
            total_slots_4w=total_slots_4w,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            contact_person=contact_person,
            contact_phone=contact_phone,
            email=email,
            password=hashed_password
        )

        # Show success and redirect
        messages.success(request, "Organization registered successfully!")
        return redirect('home')  # Change 'home' to your home URL name

    return render(request, "register_org.html")

# API Views
class OrganizationListCreateAPI(generics.ListCreateAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer


class ParkingSlotListCreateAPI(generics.ListCreateAPIView):
    queryset = ParkingSlot.objects.all()
    serializer_class = ParkingSlotSerializer


class BookingCreateAPI(generics.CreateAPIView):
    serializer_class = BookingSerializer
    queryset = Booking.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data

        # Validate slot
        try:
            slot = ParkingSlot.objects.get(id=data.get('slot'))
        except ParkingSlot.DoesNotExist:
            return Response({"error": "Slot not found"}, status=status.HTTP_404_NOT_FOUND)

        if slot.available_slots <= 0:
            return Response({"error": "No slots available"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate datetime
        try:
            start_dt = timezone.make_aware(datetime.strptime(f"{data.get('startDate')} {data.get('startTime')}", "%Y-%m-%d %H:%M"))
            end_dt = timezone.make_aware(datetime.strptime(f"{data.get('endDate')} {data.get('endTime')}", "%Y-%m-%d %H:%M"))
            if end_dt <= start_dt:
                return Response({"error": "End datetime must be after start datetime"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"error": "Invalid start or end datetime"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate token & pin
        import random, string
        token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        pin = ''.join(random.choices(string.digits, k=4))

        # Parse total cost
        try:
            total_cost = float(data.get('totalCost')) if data.get('totalCost') else 0
        except:
            total_cost = 0

        booking = Booking.objects.create(
            slot=slot,
            customer_name=data.get('customerName'),
            phone_number=data.get('phoneNumber'),
            email=data.get('email', ''),
            vehicle_type=data.get('vehicleType'),
            vehicle_number=data.get('vehicleNumber'),
            vehicle_brand=data.get('vehicleBrand', ''),
            start_datetime=start_dt,
            end_datetime=end_dt,
            total_cost=total_cost,
            token=token,
            pin=pin,
            status="confirmed"
        )

        slot.available_slots -= 1
        slot.save()

        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
   
def booking_success(request):
    token = request.GET.get('token')
    pin = request.GET.get('pin')

    # Combine token + pin for QR code
    qr_data = f"Token: {token}\nPIN: {pin}" if token and pin else ""

    qr_img_base64 = ""
    if qr_data:
        qr = qrcode.QRCode(version=1, box_size=8, border=2)
        qr.add_data(qr_data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        qr_img_base64 = base64.b64encode(buffered.getvalue()).decode()

    return render(request, 'booking_success.html', {
        'token': token,
        'pin': pin,
        'qr_img_base64': qr_img_base64
    })
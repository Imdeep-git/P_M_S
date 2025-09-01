from django.db.models import Sum, Q
from datetime import datetime
from django.shortcuts import render, redirect
from rest_framework import generics
from .models import Organization, ParkingSlot, Booking
from .serializers import OrganizationSerializer, ParkingSlotSerializer, BookingSerializer
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import qrcode
import base64
from io import BytesIO
from datetime import datetime
from django.contrib import messages
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import authenticate, login, logout, get_user_model

User = get_user_model()

# ---------------- Template Views ----------------

def home(request):
    return render(request, "index.html")

def book_slot(request):
    return render(request, "book_slot.html")

def about(request):
    return render(request, "about.html")

def contact(request):
    return render(request, "contact.html")

def checkout(request):
    return render(request, "checkout.html")


def org_dashboard(request):
    org_id = request.session.get('org_id')
    if not org_id:
        return redirect('login')

    org = Organization.objects.get(id=org_id)

    # Total slots
    total_slots = org.total_slots_2w + org.total_slots_4w

    # All slots of this organization
    slots = ParkingSlot.objects.filter(organization=org)

    # Active bookings: bookings that haven't ended yet
    now = timezone.now()
    active_bookings = Booking.objects.filter(
        slot__organization=org,
        end_datetime__gte=now
    ).count()

    # Available slots (sum of available_slots from all slots)
    available_slots = slots.aggregate(total_available=Sum('available_slots'))['total_available'] or 0

    # Monthly revenue: sum of total_cost for bookings in current month
    current_month = datetime.now().month
    current_year = datetime.now().year
    monthly_revenue = Booking.objects.filter(
        slot__organization=org,
        start_datetime__year=current_year,
        start_datetime__month=current_month
    ).aggregate(total_revenue=Sum('total_cost'))['total_revenue'] or 0

    context = {
        'org_name': org.name,
        'total_slots': total_slots,
        'active_bookings': active_bookings,
        'available_slots': available_slots,
        'monthly_revenue': monthly_revenue,
    }

    return render(request, 'org_dashboard.html', context)


def admin_dashboard(request):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return redirect('login')
    return render(request, "admin_dashboard.html")


def register(request):
    if request.method == "POST":
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

        # Hash password
        hashed_password = make_password(password)

        # Save organization
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

        messages.success(request, "Organization registered successfully!")
        return redirect('home')

    return render(request, "register_org.html")


# ---------------- Login / Logout ----------------

def login_view(request):
    if request.method == "POST":
        email = request.POST.get('email')
        password = request.POST.get('password')
        role = request.POST.get('role')  # comes from frontend toggle

        # --- Organization login ---
        if role == "organization":
            try:
                org = Organization.objects.get(email=email)
            except Organization.DoesNotExist:
                messages.error(request, "Invalid organization credentials")
                return redirect('login')

            if check_password(password, org.password):
                # ✅ Only allow org login, not admin
                request.session['org_id'] = org.id
                request.session['org_name'] = org.name
                return redirect('org_dashboard')
            else:
                messages.error(request, "Invalid organization credentials")
                return redirect('login')

        # --- Admin login ---
        elif role == "admin":
            user = authenticate(request, username=email, password=password)
            if user is not None and user.is_superuser:
                # ✅ Only allow admins to log in here
                login(request, user)
                return redirect('admin_dashboard')
            else:
                messages.error(request, "Invalid admin credentials")
                return redirect('login')

        # --- Invalid role ---
        else:
            messages.error(request, "Please select a valid role")
            return redirect('login')

    return render(request, 'login.html')


def logout_view(request):
    request.session.flush()
    logout(request)
    return redirect('login')


# ---------------- API Views ----------------

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
            start_dt = timezone.make_aware(datetime.strptime(
                f"{data.get('startDate')} {data.get('startTime')}", "%Y-%m-%d %H:%M"))
            end_dt = timezone.make_aware(datetime.strptime(
                f"{data.get('endDate')} {data.get('endTime')}", "%Y-%m-%d %H:%M"))
            if end_dt <= start_dt:
                return Response({"error": "End datetime must be after start datetime"},
                                status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"error": "Invalid start or end datetime"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Token & PIN
        import random, string
        token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        pin = ''.join(random.choices(string.digits, k=4))

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

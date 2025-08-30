from django.db import models
from django.utils import timezone
class Organization(models.Model):
    name = models.CharField(max_length=255)
    org_type = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    total_slots_2w = models.IntegerField(default=0)
    total_slots_4w = models.IntegerField(default=0)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    contact_person = models.CharField(max_length=100)
    contact_phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.name


class ParkingSlot(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="slots"
    )
    name = models.CharField(max_length=255)  # Display name of the slot
    slot_type = models.CharField(
        max_length=10,
        choices=[("2W", "Two Wheeler"), ("4W", "Four Wheeler")]
    )
    total_slots = models.IntegerField()
    available_slots = models.IntegerField()
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    features = models.JSONField(default=list, blank=True)
    location = models.CharField(max_length=100, blank=True)  # e.g., downtown, mall
    distance = models.CharField(max_length=50, blank=True)   # e.g., "0.5 km"
    address = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.organization.name} - {self.name} ({self.slot_type})"



class Booking(models.Model):
    slot = models.ForeignKey(ParkingSlot, on_delete=models.CASCADE, related_name="bookings")
    customer_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    vehicle_type = models.CharField(max_length=2, choices=[("2W","Two Wheeler"),("4W","Four Wheeler")])
    vehicle_number = models.CharField(max_length=20)
    vehicle_brand = models.CharField(max_length=100, blank=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    total_cost = models.DecimalField(max_digits=8, decimal_places=2)
    token = models.CharField(max_length=20, unique=True)
    pin = models.CharField(max_length=10)
    status = models.CharField(max_length=20, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.slot.name} ({self.token})"
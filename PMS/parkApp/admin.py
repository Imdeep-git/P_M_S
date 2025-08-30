from django.contrib import admin
from .models import Organization, ParkingSlot,Booking

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "org_type",
        "total_slots_2w",
        "total_slots_4w",
        "city",
        "state",
        "contact_person",
        "contact_phone",
        "email",
    )
    search_fields = ("name", "org_type", "city", "state", "contact_person", "email")
    list_filter = ("org_type", "city", "state")


@admin.register(ParkingSlot)
class ParkingSlotAdmin(admin.ModelAdmin):
    list_display = (
        "organization",
        "name",
        "slot_type",
        "total_slots",
        "available_slots",
        "price",
        "location",
        "distance"
    )
    list_filter = ("slot_type", "organization", "location")
    search_fields = ("organization__name", "name", "address")



@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'customer_name',
        'vehicle_number',
        'slot',
        'start_datetime',
        'end_datetime',
        'total_cost',
        'status',
    )
    
    readonly_fields = ('created_at',)  # this replaces booking_time
    list_filter = ('status', 'slot', 'vehicle_type')
    search_fields = ('customer_name', 'vehicle_number', 'token', 'pin')
    ordering = ('-created_at',)

from django.contrib import admin
from .models import Organization, ParkingSlot

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

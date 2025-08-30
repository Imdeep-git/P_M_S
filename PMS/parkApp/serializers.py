from rest_framework import serializers
from .models import Organization, ParkingSlot,Booking

class ParkingSlotSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    organization_city = serializers.CharField(source='organization.city', read_only=True)
    organization_address = serializers.CharField(source='organization.address', read_only=True)

    class Meta:
        model = ParkingSlot
        fields = [
            'id',
            'name',
            'slot_type',
            'total_slots',
            'available_slots',
            'price',
            'features',
            'location',
            'distance',
            'address',
            'organization_name',
            'organization_city',
            'organization_address'
        ]


class OrganizationSerializer(serializers.ModelSerializer):
    slots = ParkingSlotSerializer(many=True, read_only=True)

    class Meta:
        model = Organization
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

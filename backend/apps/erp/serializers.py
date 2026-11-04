import re

from django.utils import timezone
from rest_framework import serializers

from apps.tenants.serializers import TenantScopedSerializer, to_camel

from . import models

_EXCLUDE = ('tenant', 'data', 'id', 'created_at', 'updated_at')


def scoped_serializer(model_cls, read_only=(), extra_fields=None):
    attrs = {'Meta': type('Meta', (), {'model': model_cls, 'exclude': _EXCLUDE, 'read_only_fields': read_only})}
    attrs.update(extra_fields or {})
    return type(f'{model_cls.__name__}Serializer', (TenantScopedSerializer,), attrs)


class TimestampedSerializerMixin:
    """Expose the row's creation time as `createdAt` unless the frontend supplied its own."""

    def to_representation(self, instance):
        out = super().to_representation(instance)
        out.setdefault('createdAt', instance.created_at.isoformat())
        return out


PHONE_RE = re.compile(r'^[6-9]\d{9}$')
REG_RE = re.compile(r'^[A-Z]{2}[ -]?\d{1,2}[ -]?[A-Z]{0,3}[ -]?\d{1,4}$')
INSPECTION_CONDITIONS = {'GOOD', 'NEEDS_ATTENTION', 'DAMAGED', 'NA', ''}
COMPLAINT_PRIORITIES = {'LOW', 'MEDIUM', 'HIGH', 'URGENT'}
DAMAGE_MARKS = {'FRONT_LEFT', 'FRONT_RIGHT', 'REAR_LEFT', 'REAR_RIGHT'}
# Fields marked * on the job card form; a draft may be saved without them.
JOB_CARD_REQUIRED = {
    'customer_name': 'Customer name', 'customer_phone': 'Mobile number',
    'registration_number': 'Registration number', 'manufacturer': 'Manufacturer', 'model_name': 'Model',
    'in_at': 'In date & time', 'expected_delivery_at': 'Expected delivery date & time',
    'advisor_name': 'Service adviser', 'service_type': 'Service type',
}
SLOT_CAPACITY = 48 // 9  # DAILY_MAX_APPOINTMENTS / number of TIME_SLOTS (frontend slotRules.js)
TIME_SLOTS = ('08:30 - 09:30', '09:30 - 10:30', '10:30 - 11:30', '11:30 - 12:30', '13:30 - 14:30',
              '14:30 - 15:30', '15:30 - 16:30', '16:30 - 17:30', '17:30 - 18:30')


def normalise_phone(value):
    digits = re.sub(r'\D', '', value or '')
    if len(digits) == 12 and digits.startswith('91'):
        digits = digits[2:]
    return digits


class JobCardSerializer(TimestampedSerializerMixin, TenantScopedSerializer):
    class Meta:
        model = models.JobCard
        exclude = _EXCLUDE
        read_only_fields = ('job_card_number',)

    # Field keys are camelCase (CamelCaseSerializerMixin), so per-field validators use camelCase names.
    def validate_inspection(self, items):
        if not isinstance(items, list):
            raise serializers.ValidationError('Must be a list.')
        for item in items:
            if not isinstance(item, dict) or item.get('condition', '') not in INSPECTION_CONDITIONS:
                raise serializers.ValidationError(
                    f'Condition must be one of {sorted(c for c in INSPECTION_CONDITIONS if c)}.')
        return items

    def validate_complaints(self, items):
        if not isinstance(items, list):
            raise serializers.ValidationError('Must be a list.')
        for i, item in enumerate(items, 1):
            if not isinstance(item, dict):
                raise serializers.ValidationError(f'Complaint {i} is invalid.')
            if not (item.get('category') or item.get('description')):
                raise serializers.ValidationError(f'Complaint {i} needs a category or a description.')
            if item.get('priority', 'MEDIUM') not in COMPLAINT_PRIORITIES:
                raise serializers.ValidationError(f'Complaint {i} has an invalid priority.')
        return items

    def validate_damageMarks(self, marks):
        if not isinstance(marks, list) or not set(marks) <= DAMAGE_MARKS:
            raise serializers.ValidationError(f'Allowed values: {sorted(DAMAGE_MARKS)}.')
        return marks

    def validate(self, attrs):
        current = lambda name: attrs.get(name, getattr(self.instance, name, None))  # noqa: E731
        stage = current('stage') or 'CHECKED_IN'
        was_draft = self.instance is None or self.instance.stage == models.JobCard.DRAFT
        errors = {}

        # Full validation when a job card is created or leaves draft; later stage moves skip it.
        if stage != models.JobCard.DRAFT and was_draft:
            for field, label in JOB_CARD_REQUIRED.items():
                if not current(field):
                    errors[field] = f'{label} is required.'

        phone = current('customer_phone')
        if phone:
            digits = normalise_phone(phone)
            if not PHONE_RE.match(digits):
                errors['customer_phone'] = 'Enter a valid 10-digit Indian mobile number.'
            elif 'customer_phone' in attrs:
                attrs['customer_phone'] = f'+91 {digits[:5]} {digits[5:]}'
        if attrs.get('registration_number'):
            attrs['registration_number'] = attrs['registration_number'].strip().upper()
        reg = current('registration_number')
        if reg and not REG_RE.match(reg.upper()):
            errors['registration_number'] = 'Use the format AP 16 K 7038 / KA-03-JM-4921.'

        in_at, expected, actual = current('in_at'), current('expected_delivery_at'), current('actual_delivery_at')
        if in_at and expected and expected < in_at:
            errors['expected_delivery_at'] = 'Expected delivery must be after the in date & time.'
        if in_at and actual and actual < in_at:
            errors['actual_delivery_at'] = 'Actual delivery cannot be before the in date & time.'
        for start, end, label in (('insurance_start', 'insurance_expiry', 'Insurance'),
                                  ('warranty_start', 'warranty_expiry', 'Warranty')):
            if current(start) and current(end) and current(end) < current(start):
                errors[end] = f'{label} expiry must be after its start date.'
        odometer = current('odometer_km')
        if odometer is not None and odometer > 999999:
            errors['odometer_km'] = 'KMs run looks too high.'

        if errors:
            raise serializers.ValidationError({to_camel(k): v for k, v in errors.items()})
        return attrs


class ServiceAppointmentSerializer(TenantScopedSerializer):
    class Meta:
        model = models.ServiceAppointment
        exclude = _EXCLUDE
        read_only_fields = ('job_card_id',)

    def validate(self, attrs):
        current = lambda name: attrs.get(name, getattr(self.instance, name, None))  # noqa: E731
        errors = {}
        digits = normalise_phone(current('phone'))
        if not PHONE_RE.match(digits):
            errors['phone'] = 'Enter a valid 10-digit Indian mobile number.'
        elif 'phone' in attrs:
            attrs['phone'] = f'+91 {digits[:5]} {digits[5:]}'
        reg = (current('registration_number') or '').strip().upper()
        if not REG_RE.match(reg):
            errors['registration_number'] = 'Use the format AP 16 K 7038 / KA-03-JM-4921.'
        elif 'registration_number' in attrs:
            attrs['registration_number'] = reg
        if current('time_slot') not in TIME_SLOTS:
            errors['time_slot'] = 'Unknown time slot.'
        day = current('date')
        if day and day.weekday() == 6:
            errors['date'] = 'The workshop is closed on Sundays.'
        # Only new bookings (or reschedules) must be in the future; existing rows can still be updated.
        if day and current('time_slot') in TIME_SLOTS and ('date' in attrs or 'time_slot' in attrs):
            now = timezone.localtime()
            hour, minute = map(int, current('time_slot').split(' - ')[0].split(':'))
            if day < now.date():
                errors['date'] = 'Cannot book a date in the past.'
            elif day == now.date() and (hour, minute) <= (now.hour, now.minute):
                errors['time_slot'] = 'This slot has already started. Pick a later slot.'

        if not errors and current('status') != 'CANCELLED':
            request = self.context['request']
            booked = models.ServiceAppointment.objects.filter(
                tenant=request.tenant, date=day, time_slot=current('time_slot'),
            ).exclude(status='CANCELLED')
            if self.instance is not None:
                booked = booked.exclude(pk=self.instance.pk)
            if booked.count() >= SLOT_CAPACITY:
                errors['time_slot'] = f'The {current("time_slot")} slot is fully booked.'
        if errors:
            raise serializers.ValidationError({to_camel(k): v for k, v in errors.items()})
        return attrs



CustomerSerializer = scoped_serializer(models.Customer)
LeadSerializer = type('LeadSerializer', (TimestampedSerializerMixin, scoped_serializer(models.Lead)), {})
QuotationSerializer = scoped_serializer(models.Quotation)
BookingSerializer = scoped_serializer(models.Booking)
SalesOrderSerializer = scoped_serializer(models.SalesOrder)
class VehicleUnitSerializer(TenantScopedSerializer):
    """Allocation is editable, but one chassis can never be held by two bookings (or vice versa)."""

    class Meta:
        model = models.VehicleUnit
        exclude = _EXCLUDE

    def validate(self, attrs):
        new = attrs.get('allocated_booking_id')
        if new:
            current = getattr(self.instance, 'allocated_booking_id', None)
            if current and current != new:
                raise serializers.ValidationError({'allocatedBookingId': (
                    f'Chassis already allocated to booking {current}. Release it first (double allocation blocked).')})
            others = models.VehicleUnit.objects.filter(tenant=self.context['request'].tenant, allocated_booking_id=new)
            if self.instance is not None:
                others = others.exclude(pk=self.instance.pk)
            if others.exists():
                raise serializers.ValidationError({'allocatedBookingId': f'Booking {new} already holds another chassis.'})
        return attrs


PartSerializer = scoped_serializer(models.Part)
BaySerializer = scoped_serializer(models.Bay)
NotificationSerializer = scoped_serializer(models.Notification)
InvoiceSerializer = scoped_serializer(
    models.Invoice,
    read_only=('invoice_number', 'status', 'posted_at', 'posted_by'),
    extra_fields={'date': serializers.DateTimeField(required=False)},
)
ApprovalSerializer = scoped_serializer(
    models.Approval,
    read_only=('requested_by', 'requested_by_id', 'requested_by_role', 'requested_at', 'status', 'reviewed_by',
               'reviewed_at', 'reviewer_reason', 'rejection_reason'),
)


class StageSerializer(serializers.Serializer):
    stage = serializers.CharField(max_length=24)


class BayAssignSerializer(serializers.Serializer):
    bayNumber = serializers.IntegerField(min_value=1)
    jobCardId = serializers.CharField()
    branchId = serializers.CharField(required=False)


class BayReleaseSerializer(serializers.Serializer):
    bayNumber = serializers.IntegerField(min_value=1)
    branchId = serializers.CharField(required=False)


class AllocateSerializer(serializers.Serializer):
    bookingId = serializers.CharField()


class ApprovalDecisionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)

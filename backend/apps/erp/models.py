"""
Core dealership entities. Columns that are filtered, aggregated or enforced server-side are
typed; the remaining frontend attributes live in `data` (see TenantScopedModel).
All money is integer paise.
"""
from django.db import models, transaction

from apps.tenants.models import Tenant, TenantScopedModel


def _uniq_ref(name):
    return [models.UniqueConstraint(fields=['tenant', 'ref'], name=f'uniq_{name}_ref')]


class Customer(TenantScopedModel):
    REF_PREFIX = 'cust'

    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    city = models.CharField(max_length=80, blank=True)
    state_code = models.CharField(max_length=2, blank=True)
    gstin = models.CharField(max_length=15, blank=True, null=True)

    class Meta:
        ordering = ['name']
        constraints = _uniq_ref('customer')
        indexes = [
            models.Index(fields=['tenant', 'phone'], name='cust_phone'),
            models.Index(fields=['tenant', 'name'], name='cust_name'),
        ]

class Lead(TenantScopedModel):
    REF_PREFIX = 'lead'
    STAGES = ('ENQUIRY', 'TEST_RIDE', 'QUOTATION', 'BOOKING', 'FINANCE', 'DELIVERY', 'LOST')

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=32, blank=True)
    model_name = models.CharField(max_length=150, blank=True)
    stage = models.CharField(max_length=16, choices=[(s, s) for s in STAGES], default='ENQUIRY', db_index=True)
    source = models.CharField(max_length=32, blank=True)
    assigned_to_id = models.CharField(max_length=64, blank=True)
    assigned_to_name = models.CharField(max_length=150, blank=True)
    budget_paise = models.BigIntegerField(default=0)
    ai_score = models.PositiveSmallIntegerField(null=True, blank=True)
    follow_up_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = _uniq_ref('lead')
        indexes = [
            models.Index(fields=['tenant', 'stage', '-created_at'], name='lead_stage_created'),
            models.Index(fields=['tenant', 'follow_up_date'], name='lead_followup'),
            models.Index(fields=['tenant', 'phone'], name='lead_phone'),
        ]

class Quotation(TenantScopedModel):
    REF_PREFIX = 'qt'

    quotation_number = models.CharField(max_length=32, blank=True)
    customer_name = models.CharField(max_length=150, blank=True)
    model_name = models.CharField(max_length=150, blank=True)
    discount_status = models.CharField(max_length=16, blank=True)
    total_on_road_paise = models.BigIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        constraints = _uniq_ref('quotation')
        indexes = [
            models.Index(fields=['tenant', 'discount_status', '-created_at'], name='qt_status_created'),
            models.Index(fields=['tenant', 'quotation_number'], name='qt_number'),
        ]

class Booking(TenantScopedModel):
    REF_PREFIX = 'bk'

    booking_number = models.CharField(max_length=32, blank=True)
    customer_name = models.CharField(max_length=150)
    model_name = models.CharField(max_length=150, blank=True)
    token_amount_paise = models.BigIntegerField(default=0)
    total_on_road_paise = models.BigIntegerField(default=0)
    status = models.CharField(max_length=24, default='CONFIRMED', db_index=True)
    booking_date = models.DateTimeField(null=True, blank=True)
    branch_id = models.CharField(max_length=64, blank=True)
    allocated_unit_id = models.CharField(max_length=64, blank=True, null=True)
    allocated_chassis_number = models.CharField(max_length=17, blank=True, null=True)

    class Meta:
        ordering = ['-booking_date', '-created_at']
        constraints = _uniq_ref('booking')
        indexes = [
            models.Index(fields=['tenant', 'status', '-booking_date'], name='bk_status_date'),
            models.Index(fields=['tenant', '-booking_date'], name='bk_date'),
            models.Index(fields=['tenant', 'branch_id', 'status'], name='bk_branch'),
            models.Index(fields=['tenant', 'booking_number'], name='bk_number'),
        ]

class SalesOrder(TenantScopedModel):
    REF_PREFIX = 'so'

    order_number = models.CharField(max_length=32, blank=True)
    customer_name = models.CharField(max_length=150, blank=True)
    model_name = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=24, blank=True)
    grand_total_paise = models.BigIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        constraints = _uniq_ref('sales_order')
        indexes = [
            models.Index(fields=['tenant', 'status', '-created_at'], name='so_status'),
        ]

class VehicleUnit(TenantScopedModel):
    REF_PREFIX = 'unit'
    STATUSES = ('IN_STOCK', 'ALLOCATED', 'IN_TRANSIT', 'SOLD', 'DEMO')

    chassis_number = models.CharField(max_length=17)
    engine_number = models.CharField(max_length=32, blank=True)
    model_name = models.CharField(max_length=150)
    variant_name = models.CharField(max_length=100, blank=True)
    color_name = models.CharField(max_length=80, blank=True)
    status = models.CharField(max_length=16, choices=[(s, s) for s in STATUSES], default='IN_STOCK', db_index=True)
    allocated_booking_id = models.CharField(max_length=64, blank=True, null=True)
    ex_showroom_paise = models.BigIntegerField(default=0)
    purchase_cost_paise = models.BigIntegerField(default=0)
    branch_id = models.CharField(max_length=64, blank=True)
    arrival_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['model_name', 'chassis_number']
        constraints = _uniq_ref('vehicle') + [
            models.UniqueConstraint(fields=['tenant', 'chassis_number'], name='uniq_vehicle_chassis'),
        ]
        indexes = [
            models.Index(fields=['tenant', 'status', 'branch_id'], name='veh_status_branch'),
            models.Index(fields=['tenant', 'model_name'], name='veh_model'),
            models.Index(fields=['tenant', 'allocated_booking_id'], name='veh_alloc'),
        ]

class Part(TenantScopedModel):
    REF_PREFIX = 'prt'

    part_number = models.CharField(max_length=40)
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=80, blank=True)
    hsn = models.CharField(max_length=8, blank=True)
    gst_rate_percent = models.DecimalField(max_digits=5, decimal_places=2, default=18)
    unit_price_paise = models.BigIntegerField(default=0)
    cost_price_paise = models.BigIntegerField(default=0)
    stock_qty = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=0)

    class Meta:
        ordering = ['name']
        constraints = _uniq_ref('part')
        indexes = [
            models.Index(fields=['tenant', 'part_number'], name='part_number'),
            models.Index(fields=['tenant', 'stock_qty'], name='part_stock'),
        ]

class JobCard(TenantScopedModel):
    """Vehicle service job card (the "Create Vehicle Service Job Card" form)."""

    REF_PREFIX = 'jc'
    DRAFT = 'DRAFT'
    PRIORITIES = ('LOW', 'MEDIUM', 'HIGH', 'URGENT')

    job_card_number = models.CharField(max_length=32, blank=True, db_index=True)
    stage = models.CharField(max_length=24, default='CHECKED_IN', db_index=True)
    appointment_id = models.CharField(max_length=64, blank=True, null=True)
    branch_id = models.CharField(max_length=64, blank=True)

    # 1. Customer information
    customer_id = models.CharField(max_length=64, blank=True, null=True)
    customer_name = models.CharField(max_length=150, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    customer_email = models.EmailField(blank=True)
    customer_address = models.TextField(blank=True)

    # 2. Vehicle information
    registration_number = models.CharField(max_length=20, blank=True, db_index=True)
    manufacturer = models.CharField(max_length=60, blank=True)
    model_name = models.CharField(max_length=150, blank=True)
    variant = models.CharField(max_length=60, blank=True)
    vehicle_type = models.CharField(max_length=40, blank=True)
    chassis_number = models.CharField(max_length=20, blank=True)
    engine_number = models.CharField(max_length=20, blank=True)
    colour = models.CharField(max_length=40, blank=True)
    date_of_sale = models.DateField(null=True, blank=True)
    odometer_km = models.PositiveIntegerField(null=True, blank=True)
    key_number = models.CharField(max_length=20, blank=True)
    selling_dealer = models.CharField(max_length=150, blank=True)

    # 3. Job card information
    vehicle_tag_number = models.CharField(max_length=20, blank=True)
    in_at = models.DateTimeField(null=True, blank=True)
    expected_delivery_at = models.DateTimeField(null=True, blank=True)
    actual_delivery_at = models.DateTimeField(null=True, blank=True)
    advisor_name = models.CharField(max_length=150, blank=True)
    technician_id = models.CharField(max_length=64, blank=True, null=True)
    technician_name = models.CharField(max_length=150, blank=True, null=True)
    priority = models.CharField(max_length=8, choices=[(p, p) for p in PRIORITIES], default='MEDIUM')

    # 4. Service type
    service_type = models.CharField(max_length=32, blank=True)

    # 5. Insurance & warranty
    insurance_provider = models.CharField(max_length=80, blank=True)
    policy_number = models.CharField(max_length=40, blank=True)
    insurance_start = models.DateField(null=True, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)
    warranty_type = models.CharField(max_length=40, blank=True)
    warranty_start = models.DateField(null=True, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    free_service_coupon = models.CharField(max_length=30, blank=True)

    # 6. Vehicle condition & fuel level
    fuel_level = models.CharField(max_length=16, blank=True)
    damage_marks = models.JSONField(default=list, blank=True)   # e.g. ["FRONT_LEFT"]
    remarks = models.TextField(blank=True)

    # 7. Inspection checklist: [{key, label, condition, remarks}]
    inspection = models.JSONField(default=list, blank=True)
    # 8. Complaints: [{category, description, customerRemarks, reportedProblem, priority}]
    complaints = models.JSONField(default=list, blank=True)

    bay_number = models.PositiveSmallIntegerField(null=True, blank=True)
    grand_total_paise = models.BigIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        constraints = _uniq_ref('jobcard')
        indexes = [
            models.Index(fields=['tenant', 'stage', '-created_at'], name='jc_stage_created'),
            models.Index(fields=['tenant', 'registration_number'], name='jc_reg'),
            models.Index(fields=['tenant', 'job_card_number'], name='jc_number'),
            models.Index(fields=['tenant', 'appointment_id'], name='jc_appointment'),
            models.Index(fields=['tenant', 'bay_number'], name='jc_bay'),
        ]

class ServiceAppointment(TenantScopedModel):
    """A booked workshop slot. Checking the vehicle in turns it into a job card."""

    REF_PREFIX = 'apt'
    STATUSES = ('CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW')

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    registration_number = models.CharField(max_length=20)
    model_name = models.CharField(max_length=150, blank=True)
    date = models.DateField(db_index=True)
    time_slot = models.CharField(max_length=20)
    package_id = models.CharField(max_length=64, blank=True)
    package_name = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=16, choices=[(s, s) for s in STATUSES], default='CONFIRMED', db_index=True)
    job_card_id = models.CharField(max_length=64, blank=True, null=True)

    class Meta:
        ordering = ['date', 'time_slot']
        constraints = _uniq_ref('appointment')
        indexes = [
            models.Index(fields=['tenant', 'date', 'time_slot'], name='apt_date_slot'),
            models.Index(fields=['tenant', 'status', 'date'], name='apt_status_date'),
            models.Index(fields=['tenant', 'registration_number'], name='apt_reg'),
        ]

class Bay(TenantScopedModel):
    REF_PREFIX = 'bay'

    branch_id = models.CharField(max_length=64)
    bay_number = models.PositiveSmallIntegerField()
    name = models.CharField(max_length=32, blank=True)
    type = models.CharField(max_length=16, default='GENERAL')
    status = models.CharField(max_length=16, default='FREE')  # FREE, OCCUPIED, MAINTENANCE
    active_job_card_id = models.CharField(max_length=64, blank=True, null=True)
    vehicle_registration = models.CharField(max_length=20, blank=True, null=True)
    model_name = models.CharField(max_length=150, blank=True, null=True)
    technician_id = models.CharField(max_length=64, blank=True, null=True)
    technician_name = models.CharField(max_length=150, blank=True, null=True)
    started_at = models.DateTimeField(null=True, blank=True)
    estimated_minutes = models.PositiveIntegerField(default=60)
    sla_status = models.CharField(max_length=16, default='NORMAL')

    class Meta:
        ordering = ['branch_id', 'bay_number']
        constraints = _uniq_ref('bay') + [
            models.UniqueConstraint(fields=['tenant', 'branch_id', 'bay_number'], name='uniq_bay_number'),
        ]
        indexes = [
            models.Index(fields=['tenant', 'branch_id', 'status'], name='bay_status'),
        ]

class Invoice(TenantScopedModel):
    REF_PREFIX = 'inv'

    invoice_number = models.CharField(max_length=16)
    type = models.CharField(max_length=24, db_index=True)  # VEHICLE_SALE, SERVICE, PARTS, ...
    date = models.DateTimeField(db_index=True)
    customer_id = models.CharField(max_length=64, blank=True, null=True)
    customer_name = models.CharField(max_length=150)
    status = models.CharField(max_length=16, default='POSTED', db_index=True)
    items = models.JSONField(default=list)
    taxable_amount_paise = models.BigIntegerField(default=0)
    cgst_paise = models.BigIntegerField(default=0)
    sgst_paise = models.BigIntegerField(default=0)
    igst_paise = models.BigIntegerField(default=0)
    total_tax_paise = models.BigIntegerField(default=0)
    round_off_paise = models.BigIntegerField(default=0)
    grand_total_paise = models.BigIntegerField(default=0)
    paid_amount_paise = models.BigIntegerField(default=0)
    balance_due_paise = models.BigIntegerField(default=0)
    payment_status = models.CharField(max_length=16, blank=True)
    payment_mode = models.CharField(max_length=32, blank=True)
    posted_at = models.DateTimeField(null=True, blank=True)
    posted_by = models.CharField(max_length=150, blank=True)
    branch_id = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ['-date']
        constraints = _uniq_ref('invoice') + [
            models.UniqueConstraint(fields=['tenant', 'invoice_number'], name='uniq_invoice_number'),
        ]
        indexes = [
            models.Index(fields=['tenant', '-date'], name='inv_date'),
            models.Index(fields=['tenant', 'status', '-date'], name='inv_status_date'),
            models.Index(fields=['tenant', 'type', '-date'], name='inv_type_date'),
            models.Index(fields=['tenant', 'payment_status'], name='inv_payment'),
        ]

class Approval(TenantScopedModel):
    REF_PREFIX = 'appr'

    type = models.CharField(max_length=32)
    entity_id = models.CharField(max_length=64, blank=True)
    entity_type = models.CharField(max_length=32, blank=True)
    title = models.CharField(max_length=255)
    requested_by = models.CharField(max_length=150, blank=True)
    requested_by_id = models.CharField(max_length=64, blank=True)
    requested_by_role = models.CharField(max_length=32, blank=True)
    requested_at = models.DateTimeField()
    amount_paise = models.BigIntegerField(default=0)
    threshold_paise = models.BigIntegerField(default=0)
    reason = models.TextField(blank=True)
    rule_triggered = models.CharField(max_length=255, blank=True)
    escalation_hours = models.PositiveSmallIntegerField(default=4)
    status = models.CharField(max_length=16, default='PENDING', db_index=True)
    reviewed_by = models.CharField(max_length=150, blank=True, null=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer_reason = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-requested_at']
        constraints = _uniq_ref('approval')
        indexes = [
            models.Index(fields=['tenant', 'status', '-requested_at'], name='appr_status'),
        ]

class Notification(TenantScopedModel):
    REF_PREFIX = 'notif'

    type = models.CharField(max_length=32)
    severity = models.CharField(max_length=16, default='MEDIUM')
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    timestamp = models.DateTimeField()
    read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['-timestamp']
        constraints = _uniq_ref('notification')
        indexes = [
            models.Index(fields=['tenant', 'read', '-timestamp'], name='notif_read_time'),
        ]

class DocumentSequence(models.Model):
    """Gap-free per-tenant counters (e.g. invoice numbers), incremented under a row lock."""

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='+')
    key = models.CharField(max_length=32)
    last_value = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['tenant', 'key'], name='uniq_sequence_key')]

    @classmethod
    def next_value(cls, tenant, key):
        with transaction.atomic():
            seq, _ = cls.objects.select_for_update().get_or_create(tenant=tenant, key=key)
            seq.last_value += 1
            seq.save(update_fields=['last_value'])
            return seq.last_value


class Record(TenantScopedModel):
    """
    Generic tenant-scoped document for module data that has no dedicated table yet
    (complaints, warranty claims, expenses, catalogs, ...). `collection` names the list,
    e.g. "care.complaints"; `data` holds the record exactly as the frontend uses it.
    """

    REF_PREFIX = 'rec'

    collection = models.CharField(max_length=64, db_index=True)
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['collection', 'position', 'created_at']
        constraints = [models.UniqueConstraint(fields=['tenant', 'collection', 'ref'], name='uniq_record_ref')]
        indexes = [models.Index(fields=['tenant', 'collection', 'position'])]

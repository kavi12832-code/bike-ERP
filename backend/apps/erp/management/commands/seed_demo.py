"""
Loads backend/fixtures/demo_seed.json (exported from the frontend by `npm run export:seed`)
into a tenant. All timestamps are shifted so the export day becomes today, keeping the
"today" dashboard KPIs populated no matter when the seed is loaded.
"""
import json
import re
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import models as dj_models
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime

from apps.accounts.models import User
from apps.audit.models import AuditLog
from apps.erp import models as erp
from apps.erp.services import sync_invoice_sequence
from apps.tenants.models import Branch, Tenant, generate_ref

FIXTURE = Path(settings.BASE_DIR) / 'fixtures' / 'demo_seed.json'
ISO_RE = re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}')
DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
SKIP_FIELDS = {'id', 'tenant', 'ref', 'data', 'created_at', 'updated_at'}

COLLECTIONS = [
    ('customers', erp.Customer), ('leads', erp.Lead), ('quotations', erp.Quotation), ('bookings', erp.Booking),
    ('salesOrders', erp.SalesOrder), ('vehicleStock', erp.VehicleUnit), ('partsStock', erp.Part),
    ('jobCards', erp.JobCard), ('appointments', erp.ServiceAppointment), ('bays', erp.Bay), ('invoices', erp.Invoice),
    ('notifications', erp.Notification),
]


def camel_to_snake(name):
    return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()


def shift_dates(value, delta):
    if isinstance(value, dict):
        return {k: shift_dates(v, delta) for k, v in value.items()}
    if isinstance(value, list):
        return [shift_dates(v, delta) for v in value]
    if isinstance(value, str) and ISO_RE.match(value):
        parsed = parse_datetime(value)
        if parsed:
            return (parsed + delta).isoformat().replace('+00:00', 'Z')
    if isinstance(value, str) and DATE_RE.match(value):
        parsed = parse_date(value)
        if parsed:
            return (parsed + delta).isoformat()
    return value


def build_instance(model, tenant, record):
    fields = {f.name: f for f in model._meta.concrete_fields if f.name not in SKIP_FIELDS}
    # bulk_create skips save(), so records without an id (e.g. bays) get their ref here.
    ref = str(record.get('id') or '') or (
        f"bay-{record.get('branchId')}-{record.get('bayNumber')}" if model is erp.Bay else generate_ref(model.REF_PREFIX))
    kwargs, extra = {'tenant': tenant, 'ref': ref}, {}
    for key, value in record.items():
        if key == 'id':
            continue
        field = fields.get(camel_to_snake(key))
        if field is None:
            extra[key] = value
            continue
        if isinstance(field, dj_models.DateTimeField) and isinstance(value, str):
            value = parse_datetime(value)
        elif isinstance(field, dj_models.DateField) and isinstance(value, str):
            value = parse_date(value[:10])
        elif isinstance(field, dj_models.CharField) and value is None and not field.null:
            value = ''
        elif isinstance(field, dj_models.CharField) and value is not None:
            value = str(value)[:field.max_length]
        kwargs[field.name] = value
    return model(data=extra, **kwargs)


INACTIVE = ('Inactive', 'Deactivated', 'Disabled', 'Exited')
USER_CORE = {'id', 'name', 'fullName', 'email', 'role', 'avatar', 'department', 'twoFactor', 'twoFactorRequired',
             'status', 'failedAttempts', 'lockedAt', 'primaryBranchId'}


def apply_person(user, person, hq_ref):
    """Copies a staff-directory entry onto an account (never touches the password)."""
    two_factor = person.get('twoFactor') or {}
    status = person.get('status') or 'Active'
    user.ref = person['id']
    user.name = person.get('name') or person.get('fullName') or user.email
    user.role = person.get('role') or user.role or 'Sales Executive'
    user.avatar = person.get('avatar') or user.avatar or ''
    user.department = person.get('department') or ''
    user.two_factor_required = bool(two_factor.get('required', person.get('twoFactorRequired', False)))
    user.branch_ref = person.get('primaryBranchId') or hq_ref
    user.is_active = status not in INACTIVE
    user.profile = {**{k: v for k, v in person.items() if k not in USER_CORE}, 'status': status}
    user.locked_until = timezone.now() + timedelta(days=3650) if status == 'Locked' else None


class Command(BaseCommand):
    help = 'Create (or reset, or top up) a demo tenant populated with the demo data in fixtures/demo_seed.json.'

    def add_arguments(self, parser):
        parser.add_argument('--tenant', default='bike-erp', help='Tenant slug (default: bike-erp)')
        parser.add_argument('--name', default=None, help='Tenant display name')
        group = parser.add_mutually_exclusive_group()
        group.add_argument('--reset', action='store_true', help='Delete the tenant first if it exists')
        group.add_argument('--add-missing', action='store_true',
                           help='Keep everything already in the tenant; only add records, collections and users '
                                'that do not exist yet (existing accounts keep their passwords)')

    @transaction.atomic
    def handle(self, *args, **opts):
        if not FIXTURE.exists():
            raise CommandError(f'{FIXTURE} not found. Run `npm run export:seed` in the frontend first.')
        raw = json.loads(FIXTURE.read_text(encoding='utf-8'))
        exported = parse_datetime(raw['exportedAt'])
        day_shift = (timezone.localdate() - timezone.localtime(exported).date()).days
        data = shift_dates(raw, timedelta(days=day_shift))

        password = settings.DEMO_USER_PASSWORD
        if not (settings.DEBUG or settings.TESTING) and password == 'password123':
            raise CommandError('Set DEMO_USER_PASSWORD to a strong password before seeding with DEBUG off.')

        slug = opts['tenant']
        tenant = Tenant.objects.filter(slug=slug).first()
        add_missing = opts['add_missing']
        if tenant and not (opts['reset'] or add_missing):
            raise CommandError(f'Tenant "{slug}" already exists. Use --add-missing to top it up or --reset.')
        if add_missing and not tenant:
            add_missing = False  # nothing to keep: plain seed
        if tenant and opts['reset']:
            User.objects.filter(tenant=tenant).delete()
            tenant.delete()
            tenant = None

        dealer = data.get('dealership', {})
        if tenant is None:
            tenant = Tenant.objects.create(
                slug=slug, name=opts['name'] or dealer.get('name', slug), gstin=dealer.get('gstin', ''),
                state=dealer.get('state', ''), state_code=dealer.get('stateCode', ''), profile=dealer,
            )

        def add_rows(model, items):
            existing = set(model.objects.filter(tenant=tenant).values_list('ref', flat=True)) if add_missing else set()
            fresh = [build_instance(model, tenant, r) for r in items]
            fresh = [row for row in fresh if row.ref not in existing]
            model.objects.bulk_create(fresh)
            return len(fresh)

        added = {'branches': add_rows(Branch, data['branches'])}
        for key, model in COLLECTIONS:
            added[key] = add_rows(model, data.get(key, []))
        sync_invoice_sequence(tenant)

        # Module collections (catalogs, complaints, expenses, ...) previously hardcoded in the frontend.
        have = set(erp.Record.objects.filter(tenant=tenant).values_list('collection', 'ref')) if add_missing else set()
        rows = []
        for name, items in (data.get('collections') or {}).items():
            for position, item in enumerate(items, 1):
                item = dict(item) if isinstance(item, dict) else {'value': item}
                ref = str(item.pop('id', '') or f'{name.split(".")[-1][:12]}-{position}')[:64]
                if (name, ref) not in have:
                    rows.append(erp.Record(tenant=tenant, collection=name, ref=ref, data=item, position=position))
        erp.Record.objects.bulk_create(rows)
        added['moduleRecords'] = len(rows)

        # Real login accounts for the whole staff directory (Admin > Users), plus any demo persona
        # whose email is not in the directory. Existing accounts are upgraded, passwords untouched.
        hq = Branch.objects.filter(tenant=tenant, is_headquarters=True).first()
        hq_ref = hq.ref if hq else ''
        directory = list(data.get('staffDirectory') or [])
        known = {u['email'].lower() for u in directory}
        directory += [p for p in data['users'] if p['email'].lower() not in known]
        created_users = updated_users = 0
        for person in directory:
            email = person['email'].lower()
            if slug != 'bike-erp':
                local, domain = email.split('@')
                email = f'{local}+{slug}@{domain}'
            user = User.objects.filter(email__iexact=email).first()
            if user and user.tenant_id != tenant.pk:
                continue  # belongs to another tenant; never touch it
            if user is None:
                user = User(tenant=tenant, email=email, username=email)
                user.set_password(password)
                created_users += 1
            else:
                updated_users += 1
            apply_person(user, person, hq_ref)
            user.save()
        added['users'] = created_users

        AuditLog.objects.create(tenant=tenant, user_name='System', user_role='System',
                                action='TENANT_TOPPED_UP' if add_missing else 'TENANT_SEEDED',
                                entity_type='TENANT', entity_id=slug, timestamp=timezone.now())

        summary = ', '.join(f'{k}+{v}' for k, v in added.items())
        verb = 'Topped up' if add_missing else 'Seeded'
        self.stdout.write(self.style.SUCCESS(f'{verb} tenant "{slug}" (dates shifted {day_shift:+d}d): {summary}'))
        if updated_users:
            self.stdout.write(f'Updated {updated_users} existing accounts from the staff directory (passwords kept).')
        if created_users:
            self.stdout.write(f'New accounts use the password from DEMO_USER_PASSWORD; ask users to change it.')

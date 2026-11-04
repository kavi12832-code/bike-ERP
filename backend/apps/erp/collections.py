"""
Generic collections API: /api/v1/collections/<name>/[<id>/]

Each frontend module stores its records in a named collection ("care.complaints",
"accounting.expenses", ...). Rows are tenant-scoped, size-limited, role-checked by the
module prefix of the name, and every write is audited.
"""
import json
import re

from django.db import transaction
from django.db.models import Count, Max
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import record_audit
from apps.tenants.models import generate_ref

from .models import Record
from .pagination import StandardPagination

NAME_RE = re.compile(r'^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9_-]+){1,3}$')
ID_RE = re.compile(r'^[A-Za-z0-9_.:-]{1,64}$')
MAX_RECORD_BYTES = 64 * 1024
MAX_RECORDS_PER_COLLECTION = 5000

# Write access by module (the part before the first dot). Super Admin may always write;
# modules not listed are writable by any member of the tenant (pages are role-guarded too).
WRITE_ROLES = {
    'admin': {'Super Admin'},
    'catalog': {'Super Admin', 'Inventory Manager'},
    'accounting': {'Accountant'},
    'gst': {'Accountant'},
    'finance': {'Accountant', 'Sales Manager'},
    'hr': {'Super Admin', 'Accountant'},
    'reports': {'Accountant', 'Sales Manager', 'Service Manager'},
    'config': {'Super Admin'},
}
# Modules whose records are hidden from roles outside this set (read access).
READ_ROLES = {
    'admin': {'Super Admin'},
    'hr': {'Super Admin', 'Accountant'},
}


def _module(name):
    return name.split('.', 1)[0]


def check_name(name):
    if not NAME_RE.match(name):
        raise NotFound(f'Unknown collection "{name}".')
    return name


def can_read(user, name):
    roles = READ_ROLES.get(_module(name))
    return user.is_superuser or user.role == 'Super Admin' or roles is None or user.role in roles


def can_write(user, name):
    roles = WRITE_ROLES.get(_module(name))
    return user.is_superuser or user.role == 'Super Admin' or roles is None or user.role in roles


DECISION_STATUSES = {'Approved', 'Rejected', 'APPROVED', 'REJECTED'}
APPROVAL_ROLES = {'Super Admin', 'Sales Manager', 'Service Manager', 'Accountant', 'General Manager',
                  'Branch Manager', 'Finance Manager'}


def _who(user):
    return {'id': user.ref or str(user.pk), 'name': user.name or user.email, 'role': user.role, 'email': user.email}


def guard_approval(request, before, data, creating):
    """
    Dual control for "approvals.requests", enforced here rather than trusted from the browser:
    the requester is whoever is signed in, and a decision is recorded against the signed-in
    user, who must be a manager and must not be the requester.
    """
    me = _who(request.user)
    if creating:
        data.update(requesterId=me['id'], requesterName=me['name'], requesterRole=me['role'],
                    requesterEmail=me['email'])
        if data.get('status') in DECISION_STATUSES:
            raise ValidationError({'status': 'A new request cannot be created already decided.'})
        return data
    for field in ('requesterId', 'requesterName', 'requesterRole', 'requesterEmail'):
        if field in before:
            data[field] = before[field]  # immutable once raised
    if data.get('status') != before.get('status') and data.get('status') in DECISION_STATUSES:
        requester_id, requester_email = before.get('requesterId'), (before.get('requesterEmail') or '').lower()
        if me['id'] == requester_id or (requester_email and me['email'].lower() == requester_email):
            raise PermissionDenied('Dual-control violation: you cannot decide your own request.')
        if not (request.user.is_superuser or request.user.role in APPROVAL_ROLES):
            raise PermissionDenied('Your role cannot approve or reject requests.')
        data.update(decidedBy=me['name'], decidedById=me['id'], decidedAt=timezone.now().isoformat())
    return data


GUARDS = {'approvals.requests': guard_approval}


def apply_guard(request, name, before, data, creating):
    guard = GUARDS.get(name)
    return guard(request, before, data, creating) if guard else data


def serialize(record):
    return {**record.data, 'id': record.ref}


def clean_payload(payload):
    if not isinstance(payload, dict):
        raise ValidationError({'detail': 'A JSON object is required.'})
    data = {k: v for k, v in payload.items() if k != 'id'}
    if len(json.dumps(data, default=str)) > MAX_RECORD_BYTES:
        raise ValidationError({'detail': f'Record exceeds {MAX_RECORD_BYTES // 1024} KB.'})
    return data


def readable_collections(request):
    """{name: [records]} for everything this user may read (used by the bootstrap call)."""
    out = {}
    for record in Record.objects.filter(tenant=request.tenant):
        if can_read(request.user, record.collection):
            out.setdefault(record.collection, []).append(serialize(record))
    return out


NAME_PARAM = OpenApiParameter('name', OpenApiTypes.STR, OpenApiParameter.PATH,
                              description='Collection name, e.g. "care.complaints"')
ID_PARAM = OpenApiParameter('id', OpenApiTypes.STR, OpenApiParameter.PATH, description='Record id')
PAGE_PARAM = OpenApiParameter('page', OpenApiTypes.INT, description='Page number (1-based)')
PAGE_SIZE_PARAM = OpenApiParameter('pageSize', OpenApiTypes.INT, description='Records per page (max 500)')


class CollectionIndexView(APIView):
    @extend_schema(responses=OpenApiTypes.OBJECT, tags=['collections'], summary='Collection names and sizes',
                   operation_id='collections_index')
    def get(self, request):
        rows = Record.objects.filter(tenant=request.tenant).values('collection').annotate(n=Count('id'))
        return Response({r['collection']: r['n'] for r in rows if can_read(request.user, r['collection'])})


class CollectionView(APIView):
    @extend_schema(parameters=[NAME_PARAM, PAGE_PARAM, PAGE_SIZE_PARAM], responses=OpenApiTypes.OBJECT,
                   tags=['collections'], operation_id='collections_list',
                   summary='Records of a collection (paginated when page/pageSize is given)')
    def get(self, request, name):
        check_name(name)
        if not can_read(request.user, name):
            raise PermissionDenied('Your role cannot view this data.')
        records = Record.objects.filter(tenant=request.tenant, collection=name).order_by('position', 'pk')
        if 'page' in request.query_params or 'pageSize' in request.query_params:
            paginator = StandardPagination()
            page = paginator.paginate_queryset(records, request, view=self)
            return paginator.get_paginated_response([serialize(r) for r in page])
        return Response([serialize(r) for r in records])

    @extend_schema(parameters=[NAME_PARAM], request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT,
                   tags=['collections'], summary='Create a record')
    def post(self, request, name):
        check_name(name)
        if not can_write(request.user, name):
            raise PermissionDenied('Your role cannot change this data.')
        data = apply_guard(request, name, {}, clean_payload(request.data), creating=True)
        ref = str(request.data.get('id') or generate_ref(_module(name)[:6]))
        if not ID_RE.match(ref):
            raise ValidationError({'id': 'Invalid id.'})
        with transaction.atomic():
            qs = Record.objects.select_for_update().filter(tenant=request.tenant, collection=name)
            if qs.count() >= MAX_RECORDS_PER_COLLECTION:
                raise ValidationError({'detail': 'Collection is full.'})
            if qs.filter(ref=ref).exists():
                raise ValidationError({'id': f'Record "{ref}" already exists.'})
            position = (qs.aggregate(m=Max('position'))['m'] or 0) + 1
            record = Record.objects.create(tenant=request.tenant, collection=name, ref=ref, data=data,
                                           position=position)
        record_audit(request, 'RECORD_CREATED', name, ref, None, data)
        return Response(serialize(record), status=status.HTTP_201_CREATED)


class CollectionItemView(APIView):
    def _get(self, request, name, item_id, for_write=False):
        check_name(name)
        allowed = can_write if for_write else can_read
        if not allowed(request.user, name):
            raise PermissionDenied('Your role cannot change this data.' if for_write else 'Not allowed.')
        record = Record.objects.filter(tenant=request.tenant, collection=name, ref=item_id).first()
        if record is None:
            raise NotFound('Record not found.')
        return record

    @extend_schema(parameters=[NAME_PARAM, ID_PARAM], responses=OpenApiTypes.OBJECT, tags=['collections'],
                   operation_id='collections_record_retrieve')
    def get(self, request, name, item_id):
        return Response(serialize(self._get(request, name, item_id)))

    def _update(self, request, name, item_id, merge):
        record = self._get(request, name, item_id, for_write=True)
        before = dict(record.data)
        data = clean_payload(request.data)
        data = apply_guard(request, name, before, {**before, **data} if merge else data, creating=False)
        record.data = data
        record.save(update_fields=['data', 'updated_at'])
        changed = {k for k in set(before) | set(record.data) if before.get(k) != record.data.get(k)}
        record_audit(request, 'RECORD_UPDATED', name, item_id, {k: before.get(k) for k in changed},
                     {k: record.data.get(k) for k in changed})
        return Response(serialize(record))

    @extend_schema(parameters=[NAME_PARAM, ID_PARAM], request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT,
                   tags=['collections'], summary='Merge fields into a record')
    def patch(self, request, name, item_id):
        return self._update(request, name, item_id, merge=True)

    @extend_schema(parameters=[NAME_PARAM, ID_PARAM], request=OpenApiTypes.OBJECT, responses=OpenApiTypes.OBJECT,
                   tags=['collections'], summary='Replace a record')
    def put(self, request, name, item_id):
        return self._update(request, name, item_id, merge=False)

    @extend_schema(parameters=[NAME_PARAM, ID_PARAM], responses={204: None}, tags=['collections'])
    def delete(self, request, name, item_id):
        record = self._get(request, name, item_id, for_write=True)
        snapshot = dict(record.data)
        record.delete()
        record_audit(request, 'RECORD_DELETED', name, item_id, snapshot, None)
        return Response(status=status.HTTP_204_NO_CONTENT)

from datetime import timedelta

from django.db.models import Avg, Count, Q
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.audit.models import AuditLog, RequestLog
from apps.audit.serializers import AuditLogSerializer, RequestLogSerializer
from apps.audit.views import LOG_VIEWER_ROLES
from apps.erp import models as erp
from apps.erp.collections import readable_collections
from apps.erp import serializers as s
from apps.tenants.models import Branch
from apps.tenants.serializers import BranchSerializer, TenantSerializer

from .metrics import dashboard_summary

BRANCH_PARAM = OpenApiParameter('branchId', OpenApiTypes.STR, description='Branch ref; defaults to HQ branch')


class SummaryView(APIView):
    """KPIs shown on the executive dashboard, computed server-side."""

    @extend_schema(parameters=[BRANCH_PARAM], responses=OpenApiTypes.OBJECT, tags=['dashboard'])
    def get(self, request):
        return Response(dashboard_summary(request.tenant, request.query_params.get('branchId')))


class ActivityView(APIView):
    """Recent audit trail + API request health for the dashboard's activity panel."""

    @extend_schema(responses=OpenApiTypes.OBJECT, tags=['dashboard'])
    def get(self, request):
        since = timezone.now() - timedelta(hours=24)
        requests_24h = RequestLog.objects.filter(tenant=request.tenant, timestamp__gte=since)
        stats = requests_24h.aggregate(
            total=Count('id'),
            errors=Count('id', filter=Q(status_code__gte=400)),
            server_errors=Count('id', filter=Q(status_code__gte=500)),
            avg_ms=Avg('duration_ms'),
        )
        top_paths = list(requests_24h.values('method', 'path').annotate(hits=Count('id')).order_by('-hits')[:5])
        # Row-level log detail follows the same role rule as /audit-logs/ and /request-logs/.
        can_view_logs = request.user.is_superuser or request.user.role in LOG_VIEWER_ROLES
        if can_view_logs:
            audit = AuditLog.objects.filter(tenant=request.tenant).select_related('user')[:15]
            recent_requests = RequestLog.objects.filter(tenant=request.tenant).select_related('user')[:15]
        else:
            audit, recent_requests = [], []
        return Response({
            'canViewLogs': can_view_logs,
            'requestStats24h': {
                'total': stats['total'],
                'errors': stats['errors'],
                'serverErrors': stats['server_errors'],
                'avgDurationMs': round(stats['avg_ms'] or 0),
            },
            'topEndpoints': top_paths,
            'recentAudit': AuditLogSerializer(audit, many=True).data,
            'recentRequests': RequestLogSerializer(recent_requests, many=True).data,
        })


BOOTSTRAP_SETS = {
    'customers': (erp.Customer, s.CustomerSerializer),
    'leads': (erp.Lead, s.LeadSerializer),
    'quotations': (erp.Quotation, s.QuotationSerializer),
    'bookings': (erp.Booking, s.BookingSerializer),
    'salesOrders': (erp.SalesOrder, s.SalesOrderSerializer),
    'vehicleStock': (erp.VehicleUnit, s.VehicleUnitSerializer),
    'partsStock': (erp.Part, s.PartSerializer),
    'jobCards': (erp.JobCard, s.JobCardSerializer),
    'appointments': (erp.ServiceAppointment, s.ServiceAppointmentSerializer),
    'bays': (erp.Bay, s.BaySerializer),
    'invoices': (erp.Invoice, s.InvoiceSerializer),
    'notifications': (erp.Notification, s.NotificationSerializer),
}


class BootstrapView(APIView):
    """Everything the SPA store needs after login, in its own shape (one round trip)."""

    @extend_schema(responses=OpenApiTypes.OBJECT, tags=['dashboard'])
    def get(self, request):
        tenant = request.tenant
        ctx = {'request': request}
        payload = {key: ser(model.objects.filter(tenant=tenant), many=True, context=ctx).data
                   for key, (model, ser) in BOOTSTRAP_SETS.items()}
        branches = Branch.objects.filter(tenant=tenant)
        payload['branches'] = BranchSerializer(branches, many=True, context=ctx).data
        hq = branches.first()
        payload['activeBranchId'] = hq.ref if hq else None
        payload['tenant'] = TenantSerializer(tenant).data
        payload['currentUser'] = UserSerializer(request.user).data
        # Staff directory (names/roles for assignees and Admin > Users). Never includes secrets.
        payload['users'] = UserSerializer(User.objects.filter(tenant=tenant).order_by('ref'), many=True).data
        can_view_logs = request.user.is_superuser or request.user.role in LOG_VIEWER_ROLES
        payload['auditLogs'] = AuditLogSerializer(
            AuditLog.objects.filter(tenant=tenant).select_related('user')[:200], many=True).data if can_view_logs else []
        payload['collections'] = readable_collections(request)
        payload['serverTime'] = timezone.now().isoformat()
        return Response(payload)

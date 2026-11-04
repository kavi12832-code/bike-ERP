from django.db import transaction
from rest_framework import viewsets

from apps.audit.services import record_audit
from apps.tenants.permissions import HasRole, IsTenantMember


class TenantScopedViewSet(viewsets.ModelViewSet):
    """
    CRUD scoped to `request.tenant`. Records are addressed by their per-tenant `ref`
    (exposed as `id`), and every write is captured in the audit trail.
    """

    permission_classes = (IsTenantMember, HasRole)
    lookup_field = 'ref'
    lookup_url_kwarg = 'id'
    audit_entity = None

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        return self.queryset.model.objects.filter(tenant=self.request.tenant)

    def filter_queryset(self, queryset):
        # Pagination needs a total order: add the primary key as the final tie-breaker so rows
        # with equal sort values (e.g. bulk-created at the same instant) never repeat or vanish.
        queryset = super().filter_queryset(queryset)
        ordering = list(queryset.query.order_by or queryset.model._meta.ordering or [])
        if 'pk' not in ordering and '-pk' not in ordering and 'id' not in ordering:
            queryset = queryset.order_by(*ordering, 'pk')
        return queryset

    def entity_name(self):
        return self.audit_entity or self.queryset.model.__name__.upper()

    def perform_create(self, serializer):
        instance = serializer.save(tenant=self.request.tenant)
        record_audit(self.request, f'{self.entity_name()}_CREATED', self.entity_name(), instance.ref,
                     None, self.get_serializer(instance).data)

    def perform_update(self, serializer):
        before = self.get_serializer(serializer.instance).data
        instance = serializer.save()
        after = self.get_serializer(instance).data
        changed_old = {k: v for k, v in before.items() if after.get(k) != v}
        changed_new = {k: after[k] for k in changed_old if k in after}
        record_audit(self.request, f'{self.entity_name()}_UPDATED', self.entity_name(), instance.ref,
                     changed_old, changed_new)

    def before_destroy(self, instance):
        """Hook for cleaning up related records (runs in the same transaction as the delete)."""

    def perform_destroy(self, instance):
        snapshot = self.get_serializer(instance).data
        ref = instance.ref
        with transaction.atomic():
            self.before_destroy(instance)
            instance.delete()
        record_audit(self.request, f'{self.entity_name()}_DELETED', self.entity_name(), ref, snapshot, None)

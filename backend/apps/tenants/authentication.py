from django.utils import timezone
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Tenant


class TenantJWTAuthentication(JWTAuthentication):
    """
    Authenticates the Bearer token and binds `request.tenant`.

    Tenant users are always pinned to their own tenant; the token's `tenant` claim must match.
    Platform staff (no tenant) may act on a tenant by sending the `X-Tenant: <slug>` header.
    """

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None
        user, token = result

        # A lock (failed logins or an admin action) also ends sessions that are already open.
        if user.locked_until and user.locked_until > timezone.now():
            raise exceptions.AuthenticationFailed('Account is locked.')

        if user.tenant_id:
            if str(token.get('tenant_id')) != str(user.tenant_id):
                raise exceptions.AuthenticationFailed('Token tenant does not match user tenant.')
            if not user.tenant.is_active:
                raise exceptions.AuthenticationFailed('Tenant is suspended.')
            request.tenant = user.tenant
        elif user.is_staff:
            slug = request.headers.get('X-Tenant')
            request.tenant = Tenant.objects.filter(slug=slug, is_active=True).first() if slug else None
        else:
            request.tenant = None

        # Expose to Django middleware (request logging) as well as DRF views.
        request._request.tenant = request.tenant
        return user, token

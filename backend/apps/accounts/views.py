import hmac
import logging
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.core.cache import cache
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit.services import client_ip, record_audit
from apps.tenants.permissions import HasRole, IsTenantMember
from apps.tenants.viewsets import TenantScopedViewSet

from . import totp
from .models import User
from .serializers import LoginResponseSerializer, LoginSerializer, UserSerializer, UserWriteSerializer
from .tokens import issue_tokens

logger = logging.getLogger('bikeerp.auth')

INVALID_CREDENTIALS = 'Invalid email or password.'
PENDING_TOTP_KEY = 'totp-pending-{}'


def set_refresh_cookie(response, refresh):
    """The refresh token lives only in an httpOnly cookie, out of reach of page JavaScript."""
    response.set_cookie(
        settings.JWT_REFRESH_COOKIE, refresh,
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        httponly=True, secure=settings.JWT_COOKIE_SECURE, samesite=settings.JWT_COOKIE_SAMESITE,
        path=settings.JWT_COOKIE_PATH,
    )


def clear_refresh_cookie(response):
    response.delete_cookie(settings.JWT_REFRESH_COOKIE, path=settings.JWT_COOKIE_PATH,
                           samesite=settings.JWT_COOKIE_SAMESITE)


def has_ajax_header(request):
    """
    CSRF guard for the cookie-authenticated endpoints: a browser only sends this custom header
    from same-site script or after a CORS preflight that our origin allow-list approved.
    """
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest'


def body_refresh(request):
    return request.data.get('refresh') if isinstance(request.data, dict) else None


class LoginView(APIView):
    """
    Email + password login.

    * Users with 2FA get `{"otpRequired": true}` first and repeat the call with `otp`
      (authenticator-app code; the fixed DEMO_OTP is accepted only while DEBUG is on).
    * After LOGIN_MAX_FAILURES wrong passwords the account is locked for LOGIN_LOCK_MINUTES.
    * Returns the access token and profile. The refresh token is set as an httpOnly cookie.
    """

    authentication_classes = ()
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = 'login'

    @extend_schema(request=LoginSerializer, responses=LoginResponseSerializer, tags=['auth'])
    def post(self, request):
        payload = LoginSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        email = payload.validated_data['email'].lower()
        account = User.objects.filter(email__iexact=email).first()

        if account and account.locked_until and account.locked_until > timezone.now():
            minutes = int((account.locked_until - timezone.now()).total_seconds() // 60) + 1
            return Response({'detail': f'Account locked after repeated failed logins. Try again in {minutes} min.'},
                            status=status.HTTP_423_LOCKED)

        user = authenticate(request, email=email, password=payload.validated_data['password'])
        if user is None:
            if account:
                account.failed_login_count += 1
                if account.failed_login_count >= settings.LOGIN_MAX_FAILURES:
                    account.locked_until = timezone.now() + timedelta(minutes=settings.LOGIN_LOCK_MINUTES)
                    account.failed_login_count = 0
                    logger.warning('account locked user=%s ip=%s', account.email, client_ip(request))
                account.save(update_fields=['failed_login_count', 'locked_until'])
            logger.warning('login failed email=%s ip=%s', email, client_ip(request))
            return Response({'detail': INVALID_CREDENTIALS}, status=status.HTTP_401_UNAUTHORIZED)
        if user.tenant_id and not user.tenant.is_active:
            return Response({'detail': 'Tenant is suspended.'}, status=status.HTTP_403_FORBIDDEN)

        must_setup_2fa = False
        if user.totp_secret or user.two_factor_required:
            otp = (payload.validated_data.get('otp') or '').strip()
            if user.totp_secret:
                if not otp:
                    return Response({'otpRequired': True})
                if not totp.verify(user.totp_secret, otp):
                    logger.warning('login otp rejected user=%s', user.email)
                    return Response({'detail': 'Invalid authentication code.'}, status=status.HTTP_401_UNAUTHORIZED)
            elif settings.DEMO_OTP_ENABLED:
                if not otp:
                    return Response({'otpRequired': True})
                if not hmac.compare_digest(otp, settings.DEMO_OTP):
                    return Response({'detail': 'Invalid authentication code.'}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                # 2FA is required but not enrolled yet: let the user in so the client can enrol them now.
                must_setup_2fa = True

        if user.failed_login_count or user.locked_until:
            user.failed_login_count = 0
            user.locked_until = None
            user.save(update_fields=['failed_login_count', 'locked_until'])
        update_last_login(None, user)
        request.user = user
        request.tenant = user.tenant
        request._request.tenant = user.tenant
        record_audit(request, 'USER_LOGIN', 'USER', user.ref or str(user.pk), None, {'email': user.email})
        logger.info('login ok user=%s tenant=%s', user.email, user.tenant.slug if user.tenant_id else '-')

        tokens = issue_tokens(user)
        response = Response({'otpRequired': False, 'mustSetupTwoFactor': must_setup_2fa,
                             'access': tokens['access'], 'user': UserSerializer(user).data})
        set_refresh_cookie(response, tokens['refresh'])
        return response


class RefreshView(APIView):
    """
    New access token from the refresh token: the httpOnly cookie (browser, needs the
    `X-Requested-With: XMLHttpRequest` header) or `refresh` in the body (API clients).
    Refresh tokens rotate and the previous one is blacklisted.
    """

    authentication_classes = ()
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = 'refresh'

    @extend_schema(request=None, responses={200: LoginResponseSerializer}, tags=['auth'])
    def post(self, request):
        token = body_refresh(request)
        from_cookie = not token
        if from_cookie:
            token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
            if token and not has_ajax_header(request):
                return Response({'detail': 'Missing X-Requested-With header.'}, status=status.HTTP_403_FORBIDDEN)
        if not token:
            return Response({'detail': 'Not signed in.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TokenRefreshSerializer(data={'refresh': token})
        try:
            serializer.is_valid(raise_exception=True)
        except (TokenError, InvalidToken, ValidationError):
            response = Response({'detail': 'Session expired. Please sign in again.'},
                                status=status.HTTP_401_UNAUTHORIZED)
            clear_refresh_cookie(response)
            return response

        data = serializer.validated_data
        if not from_cookie:
            return Response(data)
        response = Response({'access': data['access']})
        if data.get('refresh'):
            set_refresh_cookie(response, data['refresh'])
        return response


class LogoutView(APIView):
    """Blacklists the refresh token (cookie or body) and clears the cookie."""

    authentication_classes = ()
    permission_classes = (AllowAny,)

    @extend_schema(request=None, responses={205: None}, tags=['auth'])
    def post(self, request):
        token = body_refresh(request)
        if not token:
            if request.COOKIES.get(settings.JWT_REFRESH_COOKIE) and not has_ajax_header(request):
                return Response({'detail': 'Missing X-Requested-With header.'}, status=status.HTTP_403_FORBIDDEN)
            token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
        if token:
            try:
                RefreshToken(token).blacklist()
            except TokenError:
                pass
        response = Response(status=status.HTTP_205_RESET_CONTENT)
        clear_refresh_cookie(response)
        return response


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(responses=UserSerializer, tags=['auth'])
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class TwoFactorCodeSerializer(drf_serializers.Serializer):
    code = drf_serializers.CharField(max_length=8)


class TwoFactorSetupView(APIView):
    """Starts authenticator-app enrolment: returns a new secret and its otpauth:// URI (show it as a QR code)."""

    permission_classes = (IsAuthenticated,)

    @extend_schema(request=None, responses={200: None}, tags=['auth'])
    def post(self, request):
        user = request.user
        secret = totp.new_secret()
        # Held server-side for 10 minutes; only activated after /2fa/confirm/ proves the app works.
        cache.set(PENDING_TOTP_KEY.format(user.pk), secret, timeout=600)
        issuer = user.tenant.name if user.tenant_id else 'Bike ERP'
        return Response({'secret': secret, 'otpauthUri': totp.provisioning_uri(secret, user.email, issuer)})


class TwoFactorConfirmView(APIView):
    """Activates 2FA once the user enters a valid code from the authenticator app."""

    permission_classes = (IsAuthenticated,)

    @extend_schema(request=TwoFactorCodeSerializer, responses={200: None}, tags=['auth'])
    def post(self, request):
        body = TwoFactorCodeSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        key = PENDING_TOTP_KEY.format(request.user.pk)
        secret = cache.get(key)
        if not secret:
            return Response({'detail': 'Setup expired. Start again.'}, status=status.HTTP_400_BAD_REQUEST)
        if not totp.verify(secret, body.validated_data['code']):
            return Response({'detail': 'That code is not valid. Check the time on your phone.'},
                            status=status.HTTP_400_BAD_REQUEST)
        request.user.totp_secret = secret
        request.user.two_factor_required = True
        request.user.save(update_fields=['totp_secret', 'two_factor_required'])
        cache.delete(key)
        record_audit(request, 'USER_2FA_ENABLED', 'USER', request.user.ref or str(request.user.pk), None, None)
        return Response({'twoFactorEnabled': True})


@extend_schema(tags=['users'])
class UserViewSet(TenantScopedViewSet):
    """Staff accounts of the current tenant (admin only for writes)."""

    queryset = User.objects.all()
    permission_classes = (IsTenantMember, HasRole)
    write_roles = {'Super Admin'}
    lookup_field = 'ref'
    lookup_url_kwarg = 'id'
    audit_entity = 'USER'
    search_fields = ('name', 'email', 'role')

    def get_serializer_class(self):
        return UserSerializer if self.request.method in ('GET', 'HEAD') else UserWriteSerializer

    def perform_create(self, serializer):
        user = serializer.save(tenant=self.request.tenant)
        if not user.ref:
            user.ref = f'usr-{user.pk:04d}'
            user.save(update_fields=['ref'])
        record_audit(self.request, 'USER_CREATED', 'USER', user.ref, None, UserSerializer(user).data)

    def perform_update(self, serializer):
        data = serializer.validated_data
        if serializer.instance.pk == self.request.user.pk:
            if 'role' in data and data['role'] != self.request.user.role:
                raise ValidationError({'role': 'You cannot change your own role.'})
            if data.get('_status') in ('Inactive', 'Deactivated', 'Disabled', 'Exited', 'Locked'):
                raise ValidationError({'status': 'You cannot lock or deactivate your own account.'})
        user = serializer.save()
        record_audit(self.request, 'USER_UPDATED', 'USER', user.ref, None, UserSerializer(user).data)

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise ValidationError({'detail': 'You cannot deactivate your own account.'})
        # Deactivate instead of delete so the audit trail keeps resolving.
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        record_audit(self.request, 'USER_DEACTIVATED', 'USER', instance.ref, None, None)

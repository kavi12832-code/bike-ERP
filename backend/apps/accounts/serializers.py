from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.tenants.serializers import CamelCaseSerializerMixin

from .models import User


from datetime import timedelta

from django.utils import timezone

# Directory status values used by Admin > Users; they drive the real account flags.
INACTIVE_STATUSES = {'Inactive', 'Deactivated', 'Disabled', 'Exited'}
LOCKED_STATUS = 'Locked'
PROFILE_BLOCKLIST = {'password', 'passwordHash', 'totpSecret', 'otp'}


class UserSerializer(CamelCaseSerializerMixin, serializers.ModelSerializer):
    """
    A staff directory entry in the shape the frontend uses: directory attributes from `profile`
    merged with the account fields. `id` is the user's public ref (e.g. "usr-001").
    """

    id = serializers.CharField(source='ref', required=False, max_length=64)
    tenant_slug = serializers.CharField(source='tenant.slug', read_only=True, default=None)
    status = serializers.SerializerMethodField()
    two_factor_enabled = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'role', 'avatar', 'department', 'branch_ref', 'two_factor_required',
                  'two_factor_enabled', 'tenant_slug', 'is_active', 'last_login', 'status')
        read_only_fields = ('last_login',)

    def get_status(self, obj) -> str:
        if not obj.is_active:
            return obj.profile.get('status') if obj.profile.get('status') in INACTIVE_STATUSES else 'Inactive'
        if obj.locked_until and obj.locked_until > timezone.now():
            return LOCKED_STATUS
        return 'Active' if obj.profile.get('status') in (None, LOCKED_STATUS) or obj.profile.get('status') in \
            INACTIVE_STATUSES else obj.profile['status']

    def get_two_factor_enabled(self, obj) -> bool:
        return bool(obj.totp_secret)

    def to_representation(self, instance):
        core = super().to_representation(instance)
        core['id'] = instance.ref or str(instance.pk)
        two_factor = {**(instance.profile.get('twoFactor') or {}), 'required': instance.two_factor_required,
                      'enabled': bool(instance.totp_secret)}
        return {**instance.profile, **core, 'fullName': instance.profile.get('fullName') or instance.name,
                'twoFactor': two_factor, 'failedAttempts': instance.failed_login_count,
                'lockedAt': instance.profile.get('lockedAt') if core['status'] == LOCKED_STATUS else None}


class UserWriteSerializer(UserSerializer):
    """Create/update accounts. Unknown keys are kept in `profile`; status/twoFactor update the real flags."""

    password = serializers.CharField(write_only=True, min_length=10, required=False)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ('password',)

    def to_internal_value(self, payload):
        known = set(self.fields.keys())
        extra = {k: v for k, v in payload.items() if k not in known and k not in PROFILE_BLOCKLIST}
        validated = super().to_internal_value({k: v for k, v in payload.items() if k in known})
        status = payload.get('status')
        if status is not None:
            validated['_status'] = status
            extra['status'] = status
        two_factor = payload.get('twoFactor')
        if isinstance(two_factor, dict) and 'required' in two_factor:
            validated['two_factor_required'] = bool(two_factor['required'])
        if not validated.get('name') and payload.get('fullName'):
            validated['name'] = payload['fullName']
        if extra:
            profile = dict(self.instance.profile) if self.instance is not None else {}
            profile.update(extra)
            profile.pop('failedAttempts', None)
            validated['profile'] = profile
        return validated

    def validate_id(self, value):
        request = self.context.get('request')
        qs = User.objects.filter(tenant=getattr(request, 'tenant', None), ref=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f'User "{value}" already exists.')
        return value

    def validate_email(self, value):
        qs = User.objects.filter(email__iexact=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def validate(self, attrs):
        password = attrs.get('password')
        if password:
            candidate = self.instance or User(email=attrs.get('email', ''), name=attrs.get('name', ''))
            validate_password(password, candidate)
        return attrs

    @staticmethod
    def _apply_status(user, status):
        if status is None:
            return
        if status in INACTIVE_STATUSES:
            user.is_active = False
        elif status == LOCKED_STATUS:
            user.is_active = True
            user.locked_until = timezone.now() + timedelta(days=3650)  # until an admin unlocks
        else:
            user.is_active = True
            user.locked_until = None
            user.failed_login_count = 0

    def create(self, validated):
        password = validated.pop('password', None)
        status = validated.pop('_status', None)
        user = User(**validated)
        user.username = user.email
        self._apply_status(user, status)
        user.set_password(password) if password else user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated):
        password = validated.pop('password', None)
        status = validated.pop('_status', None)
        for key, value in validated.items():
            setattr(instance, key, value)
        if 'email' in validated:
            instance.username = instance.email
        self._apply_status(instance, status)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    otp = serializers.CharField(required=False, allow_blank=True, max_length=8)


class LoginResponseSerializer(serializers.Serializer):
    otpRequired = serializers.BooleanField()
    mustSetupTwoFactor = serializers.BooleanField(required=False)
    access = serializers.CharField(required=False, help_text='Short-lived; send as "Authorization: Bearer".')
    user = UserSerializer(required=False)

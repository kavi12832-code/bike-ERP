from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (LoginView, LogoutView, MeView, RefreshView, TwoFactorConfirmView, TwoFactorSetupView,
                    UserViewSet)

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('2fa/confirm/', TwoFactorConfirmView.as_view(), name='2fa-confirm'),
    *router.urls,
]

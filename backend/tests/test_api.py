from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from apps.audit.models import AuditLog, RequestLog
from apps.erp.models import Bay, Invoice, JobCard

ADMIN = 'rajesh.varma@akashbajaj.com'          # Super Admin, 2FA required
SALES_EXEC = 'deepak.rao@akashbajaj.com'       # Sales Executive
SALES_MGR = 'vikram.sethi@akashbajaj.com'      # Sales Manager
ACCOUNTANT_ROLE = 'Accountant'
PASSWORD = 'password123'
OTP = '123456'


class ApiTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_demo', verbosity=0, stdout=open('nul' if __import__('os').name == 'nt' else '/dev/null', 'w'))
        call_command('seed_demo', tenant='demo-motors', name='Demo Motors', verbosity=0,
                     stdout=open('nul' if __import__('os').name == 'nt' else '/dev/null', 'w'))

    def login(self, email, otp=None):
        client = APIClient()
        body = {'email': email, 'password': PASSWORD}
        if otp:
            body['otp'] = otp
        res = client.post('/api/v1/auth/login/', body, format='json')
        if res.status_code == 200 and res.data.get('otpRequired') and not otp:
            # Directory users may have 2FA switched on; the demo code works in tests.
            res = client.post('/api/v1/auth/login/', {**body, 'otp': OTP}, format='json')
        self.assertEqual(res.status_code, 200, res.content)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        return client, res.data


class AuthTests(ApiTestCase):
    def test_wrong_password_rejected(self):
        res = APIClient().post('/api/v1/auth/login/', {'email': SALES_EXEC, 'password': 'nope'}, format='json')
        self.assertEqual(res.status_code, 401)

    def test_two_factor_flow(self):
        client = APIClient()
        first = client.post('/api/v1/auth/login/', {'email': ADMIN, 'password': PASSWORD}, format='json')
        self.assertTrue(first.data['otpRequired'])
        self.assertNotIn('access', first.data)
        bad = client.post('/api/v1/auth/login/', {'email': ADMIN, 'password': PASSWORD, 'otp': '000000'}, format='json')
        self.assertEqual(bad.status_code, 401)
        _, data = self.login(ADMIN, OTP)
        self.assertEqual(data['user']['role'], 'Super Admin')
        self.assertEqual(data['user']['id'], 'usr-001')  # staff directory id

    def test_requires_token(self):
        self.assertEqual(APIClient().get('/api/v1/leads/').status_code, 401)

    def test_refresh_and_me(self):
        client, data = self.login(SALES_EXEC)
        me = client.get('/api/v1/auth/me/')
        self.assertEqual(me.data['email'], SALES_EXEC)
        self.assertNotIn('refresh', data)  # refresh token is only in the httpOnly cookie
        cookie = client.cookies['bikeerp_refresh']
        self.assertTrue(cookie['httponly'])
        # Cookie refresh needs the anti-CSRF header.
        self.assertEqual(client.post('/api/v1/auth/refresh/').status_code, 403)
        refreshed = client.post('/api/v1/auth/refresh/', HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(refreshed.status_code, 200)
        self.assertIn('access', refreshed.data)
        # Rotation: the old refresh token is blacklisted.
        stale = APIClient().post('/api/v1/auth/refresh/', {'refresh': cookie.value}, format='json')
        self.assertEqual(stale.status_code, 401)


class TenantIsolationTests(ApiTestCase):
    def test_each_tenant_sees_only_its_rows(self):
        client, _ = self.login(SALES_EXEC)
        other, _ = self.login('deepak.rao+demo-motors@akashbajaj.com')
        created = client.post('/api/v1/leads/', {'customerName': 'Only In AKASH Bajaj', 'phone': '+91 90000 00000',
                                                 'aiScoreTier': 'HOT'}, format='json')
        self.assertEqual(created.status_code, 201, created.content)
        self.assertEqual(created.data['aiScoreTier'], 'HOT')  # unknown keys round-trip via `data`
        lead_id = created.data['id']
        self.assertEqual(client.get(f'/api/v1/leads/{lead_id}/').status_code, 200)
        self.assertEqual(other.get(f'/api/v1/leads/{lead_id}/').status_code, 404)
        names = [lead['customerName'] for lead in other.get('/api/v1/leads/?pageSize=500').data['results']]
        self.assertNotIn('Only In AKASH Bajaj', names)

    def test_same_ref_allowed_in_two_tenants(self):
        self.assertEqual(JobCard.objects.filter(ref='jc-2627-001').count(), 2)


class BusinessRuleTests(ApiTestCase):
    def test_invoice_numbers_are_sequential_and_immutable(self):
        client, _ = self.login(SALES_EXEC)
        self.assertEqual(client.post('/api/v1/invoices/', {}, format='json').status_code, 403)

        from apps.accounts.models import User
        accountant = User.objects.filter(tenant__slug='bike-erp', role=ACCOUNTANT_ROLE).first()
        client, _ = self.login(accountant.email, OTP if accountant.two_factor_required else None)
        count = Invoice.objects.filter(tenant__slug='bike-erp').count()
        body = {'type': 'SERVICE', 'customerName': 'Walk-in', 'grandTotalPaise': 118000, 'totalTaxPaise': 18000,
                'items': [{'description': 'Labour', 'lineTotalPaise': 118000}]}
        first = client.post('/api/v1/invoices/', body, format='json')
        second = client.post('/api/v1/invoices/', body, format='json')
        self.assertEqual(first.status_code, 201, first.content)
        self.assertEqual(first.data['invoiceNumber'], f'VI/2627/{count + 1:05d}')
        self.assertEqual(second.data['invoiceNumber'], f'VI/2627/{count + 2:05d}')
        self.assertEqual(client.patch(f"/api/v1/invoices/{first.data['id']}/", {'customerName': 'Edited'},
                                      format='json').status_code, 400)
        self.assertEqual(client.delete(f"/api/v1/invoices/{first.data['id']}/").status_code, 405)

    def test_dual_control_blocks_self_approval(self):
        mgr, _ = self.login(SALES_MGR)
        req = mgr.post('/api/v1/approvals/', {'type': 'discount', 'title': 'Extra 2k off', 'amountPaise': 200000},
                       format='json')
        self.assertEqual(req.status_code, 201, req.content)
        self.assertEqual(mgr.post(f"/api/v1/approvals/{req.data['id']}/approve/", {}, format='json').status_code, 403)

        admin, _ = self.login(ADMIN, OTP)
        self.assertEqual(admin.post(f"/api/v1/approvals/{req.data['id']}/reject/", {}, format='json').status_code, 400)
        ok = admin.post(f"/api/v1/approvals/{req.data['id']}/approve/", {'reason': 'fine'}, format='json')
        self.assertEqual(ok.data['status'], 'APPROVED')

    def test_bay_assignment_moves_job_card(self):
        admin, _ = self.login(ADMIN, OTP)
        free = Bay.objects.filter(tenant__slug='bike-erp', status='FREE').order_by('bay_number')[:2]
        card = JobCard.objects.filter(tenant__slug='bike-erp', bay_number__isnull=True).first()
        res = admin.post('/api/v1/bays/assign/', {'bayNumber': free[0].bay_number, 'jobCardId': card.ref}, format='json')
        self.assertEqual(res.status_code, 200, res.content)
        admin.post('/api/v1/bays/assign/', {'bayNumber': free[1].bay_number, 'jobCardId': card.ref}, format='json')
        free[0].refresh_from_db()
        self.assertEqual(free[0].status, 'FREE')  # previous bay released
        occupied = Bay.objects.filter(tenant__slug='bike-erp', status='OCCUPIED').exclude(active_job_card_id=None)
        busy = occupied.exclude(active_job_card_id=card.ref).first()
        clash = admin.post('/api/v1/bays/assign/', {'bayNumber': busy.bay_number, 'jobCardId': card.ref}, format='json')
        self.assertEqual(clash.status_code, 400)

    def test_double_chassis_allocation_blocked(self):
        admin, _ = self.login(ADMIN, OTP)
        unit = admin.get('/api/v1/vehicles/?pageSize=500').data['results'][0]
        first_booking, other_booking = admin.get('/api/v1/bookings/?pageSize=500').data['results'][:2]
        ok = admin.post(f"/api/v1/vehicles/{unit['id']}/allocate/", {'bookingId': first_booking['id']}, format='json')
        self.assertEqual(ok.status_code, 200, ok.content)
        allocated = ok.data
        res = admin.post(f"/api/v1/vehicles/{allocated['id']}/allocate/", {'bookingId': other_booking['id']},
                         format='json')
        self.assertEqual(res.status_code, 400)
        # The plain PATCH path (used by the store sync) enforces the same rule.
        patched = admin.patch(f"/api/v1/vehicles/{allocated['id']}/", {'allocatedBookingId': other_booking['id']},
                              format='json')
        self.assertEqual(patched.status_code, 400)


class DashboardAndLogTests(ApiTestCase):
    def test_summary_matches_seed(self):
        admin, _ = self.login(ADMIN, OTP)
        summary = admin.get('/api/v1/dashboard/summary/').data
        self.assertEqual(summary['bayStats']['total'], 12)
        stats = summary['bayStats']
        self.assertEqual(stats['occupied'] + stats['readyForDelivery'] + stats['waitingParts'] +
                         stats['qualityCheck'] + stats['available'], 12)
        self.assertGreater(summary['invoicesClosedCount'], 0)
        self.assertEqual(len(summary['last7DaysTrend']), 7)

    def test_bootstrap_has_store_shape(self):
        admin, _ = self.login(ADMIN, OTP)
        data = admin.get('/api/v1/dashboard/bootstrap/').data
        for key in ('invoices', 'bays', 'jobCards', 'vehicleStock', 'partsStock', 'leads', 'auditLogs',
                    'branches', 'currentUser', 'users', 'collections'):
            self.assertIn(key, data)
        self.assertTrue(data['collections']['approvals.requests'])
        self.assertTrue(data['collections']['catalog.bikes'])
        self.assertEqual(data['activeBranchId'], 'br-blr-central')
        bay = data['bays'][0]
        self.assertIn('bayNumber', bay)
        self.assertIn('activeJobCardId', bay)

    def test_requests_and_audit_are_logged(self):
        admin, _ = self.login(ADMIN, OTP)
        admin.get('/api/v1/leads/')
        self.assertTrue(RequestLog.objects.filter(path='/api/v1/leads/', tenant__slug='bike-erp').exists())
        self.assertTrue(AuditLog.objects.filter(action='USER_LOGIN', tenant__slug='bike-erp').exists())
        activity = admin.get('/api/v1/dashboard/activity/').data
        self.assertGreaterEqual(activity['requestStats24h']['total'], 1)
        self.assertTrue(activity['recentAudit'])

    def test_logs_restricted_by_role(self):
        sales, _ = self.login(SALES_EXEC)
        self.assertEqual(sales.get('/api/v1/audit-logs/').status_code, 403)

    def test_swagger_served(self):
        self.assertEqual(APIClient().get('/api/schema/').status_code, 200)
        self.assertEqual(APIClient().get('/api/docs/').status_code, 200)

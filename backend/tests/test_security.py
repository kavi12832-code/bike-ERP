from django.test import override_settings
from rest_framework.test import APIClient

from apps.accounts import totp
from apps.accounts.models import User
from apps.erp.models import Record

from .test_api import ADMIN, OTP, PASSWORD, SALES_EXEC, ApiTestCase

ACCOUNTANT = 'suresh.iyer@akashbajaj.com'


class LockoutAndTwoFactorTests(ApiTestCase):
    def test_account_locks_after_repeated_failures(self):
        client = APIClient()
        for _ in range(5):
            res = client.post('/api/v1/auth/login/', {'email': SALES_EXEC, 'password': 'wrong'}, format='json')
            self.assertEqual(res.status_code, 401)
        locked = client.post('/api/v1/auth/login/', {'email': SALES_EXEC, 'password': PASSWORD}, format='json')
        self.assertEqual(locked.status_code, 423)
        User.objects.filter(email=SALES_EXEC).update(locked_until=None)
        self.login(SALES_EXEC)  # success resets the counter

    def test_totp_enrolment_and_login(self):
        client, _ = self.login(SALES_EXEC)
        setup = client.post('/api/v1/auth/2fa/setup/')
        self.assertTrue(setup.data['otpauthUri'].startswith('otpauth://totp/'))
        self.assertEqual(client.post('/api/v1/auth/2fa/confirm/', {'code': '000000'}).status_code, 400)
        ok = client.post('/api/v1/auth/2fa/confirm/', {'code': totp.now_code(setup.data['secret'])})
        self.assertEqual(ok.status_code, 200)

        anon = APIClient()
        first = anon.post('/api/v1/auth/login/', {'email': SALES_EXEC, 'password': PASSWORD}, format='json')
        self.assertTrue(first.data['otpRequired'])
        # The fixed demo code no longer works once a real authenticator is enrolled.
        demo = anon.post('/api/v1/auth/login/', {'email': SALES_EXEC, 'password': PASSWORD, 'otp': OTP},
                         format='json')
        self.assertEqual(demo.status_code, 401)
        good = anon.post('/api/v1/auth/login/', {'email': SALES_EXEC, 'password': PASSWORD,
                                                 'otp': totp.now_code(setup.data['secret'])}, format='json')
        self.assertEqual(good.status_code, 200, good.content)

    @override_settings(DEMO_OTP_ENABLED=False)
    def test_demo_otp_rejected_in_production(self):
        res = APIClient().post('/api/v1/auth/login/', {'email': ADMIN, 'password': PASSWORD, 'otp': OTP},
                               format='json')
        # 2FA required but not enrolled: signed in, and told to enrol.
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['mustSetupTwoFactor'])

    def test_logout_revokes_refresh_cookie(self):
        client, _ = self.login(SALES_EXEC)
        token = client.cookies['bikeerp_refresh'].value
        self.assertEqual(client.post('/api/v1/auth/logout/', HTTP_X_REQUESTED_WITH='XMLHttpRequest').status_code,
                         205)
        self.assertEqual(APIClient().post('/api/v1/auth/refresh/', {'refresh': token}, format='json').status_code,
                         401)

    def test_weak_password_rejected_for_new_users(self):
        admin, _ = self.login(ADMIN, OTP)
        res = admin.post('/api/v1/auth/users/', {'email': 'new@akashbajaj.com', 'name': 'New', 'role': 'Technician',
                                                 'password': '12345678'}, format='json')
        self.assertEqual(res.status_code, 400)


class CollectionApiTests(ApiTestCase):
    def test_crud_and_tenant_isolation(self):
        sales, _ = self.login(SALES_EXEC)
        created = sales.post('/api/v1/collections/care.complaints/', {'id': 'cmp-1', 'title': 'Brake noise'},
                             format='json')
        self.assertEqual(created.status_code, 201, created.content)
        self.assertEqual(sales.patch('/api/v1/collections/care.complaints/cmp-1/', {'status': 'OPEN'},
                                     format='json').data['status'], 'OPEN')
        items = sales.get('/api/v1/collections/care.complaints/').data
        self.assertEqual([i['id'] for i in items if i['id'] == 'cmp-1'], ['cmp-1'])

        other, _ = self.login('deepak.rao+demo-motors@akashbajaj.com')
        self.assertEqual(other.get('/api/v1/collections/care.complaints/cmp-1/').status_code, 404)
        self.assertEqual(sales.delete('/api/v1/collections/care.complaints/cmp-1/').status_code, 204)
        self.assertFalse(Record.objects.filter(ref='cmp-1').exists())

    def test_module_write_roles(self):
        sales, _ = self.login(SALES_EXEC)
        denied = sales.post('/api/v1/collections/accounting.expenses/', {'amount': 1}, format='json')
        self.assertEqual(denied.status_code, 403)
        self.assertEqual(sales.get('/api/v1/collections/admin.securityPolicies/').status_code, 403)
        accountant, _ = self.login(ACCOUNTANT, OTP if User.objects.get(email=ACCOUNTANT).two_factor_required else None)
        self.assertEqual(accountant.post('/api/v1/collections/accounting.expenses/', {'amount': 1},
                                         format='json').status_code, 201)

    def test_bad_names_and_oversized_records(self):
        sales, _ = self.login(SALES_EXEC)
        self.assertEqual(sales.get('/api/v1/collections/..%2Fetc/').status_code, 404)
        big = sales.post('/api/v1/collections/care.notes/', {'blob': 'x' * 70000}, format='json')
        self.assertEqual(big.status_code, 400)

    def test_bootstrap_includes_collections(self):
        sales, _ = self.login(SALES_EXEC)
        sales.post('/api/v1/collections/care.complaints/', {'id': 'cmp-2', 'title': 'x'}, format='json')
        data = sales.get('/api/v1/dashboard/bootstrap/').data
        self.assertIn('cmp-2', [i['id'] for i in data['collections']['care.complaints']])


class DirectoryAndApprovalGuardTests(ApiTestCase):
    def test_admin_lock_blocks_login_and_open_sessions(self):
        admin, _ = self.login(ADMIN, OTP)
        target, _ = self.login(SALES_EXEC)
        sales_id = User.objects.get(email=SALES_EXEC).ref
        res = admin.patch(f'/api/v1/auth/users/{sales_id}/', {'status': 'Locked'}, format='json')
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.data['status'], 'Locked')
        self.assertEqual(target.get('/api/v1/auth/me/').status_code, 401)  # open session ended
        again = APIClient().post('/api/v1/auth/login/', {'email': SALES_EXEC, 'password': PASSWORD}, format='json')
        self.assertEqual(again.status_code, 423)
        admin.patch(f'/api/v1/auth/users/{sales_id}/', {'status': 'Active'}, format='json')
        self.login(SALES_EXEC)

    def test_admin_cannot_lock_self_and_profile_round_trips(self):
        admin, data = self.login(ADMIN, OTP)
        me = data['user']['id']
        self.assertEqual(admin.patch(f'/api/v1/auth/users/{me}/', {'status': 'Locked'}, format='json').status_code,
                         400)
        res = admin.patch(f'/api/v1/auth/users/{me}/', {'designation': 'Principal'}, format='json')
        self.assertEqual(res.data['designation'], 'Principal')
        self.assertNotIn('totpSecret', res.data)

    def test_approval_dual_control_on_collection(self):
        sales, sales_login = self.login(SALES_EXEC)
        req = sales.post('/api/v1/collections/approvals.requests/', {
            'id': 'APR-T-1', 'title': 'Extra discount', 'status': 'Pending', 'requesterId': 'someone-else',
        }, format='json')
        self.assertEqual(req.status_code, 201, req.content)
        self.assertEqual(req.data['requesterId'], sales_login['user']['id'])  # server sets the requester
        self_approve = sales.patch('/api/v1/collections/approvals.requests/APR-T-1/', {'status': 'Approved'},
                                   format='json')
        self.assertEqual(self_approve.status_code, 403)
        admin, admin_login = self.login(ADMIN, OTP)
        ok = admin.patch('/api/v1/collections/approvals.requests/APR-T-1/', {'status': 'Approved',
                                                                            'decidedBy': 'forged'}, format='json')
        self.assertEqual(ok.status_code, 200, ok.content)
        self.assertEqual(ok.data['decidedById'], admin_login['user']['id'])

    def test_seed_add_missing_keeps_existing_data(self):
        from io import StringIO

        from django.core.management import call_command

        from apps.erp.models import JobCard
        JobCard.objects.filter(tenant__slug='bike-erp', ref='jc-2627-001').update(customer_name='Kept Value')
        call_command('seed_demo', add_missing=True, stdout=StringIO())
        self.assertEqual(JobCard.objects.get(tenant__slug='bike-erp', ref='jc-2627-001').customer_name, 'Kept Value')
        self.login(SALES_EXEC)  # passwords untouched

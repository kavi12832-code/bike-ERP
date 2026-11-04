from django.db import connection

from apps.erp.models import Bay, Booking, JobCard, ServiceAppointment, VehicleUnit

from .test_api import ADMIN, OTP, ApiTestCase
from .test_job_cards import SERVICE_ADVISOR, job_card_payload, next_weekday


class BookingCrudTests(ApiTestCase):
    def test_create_read_update_delete(self):
        admin, _ = self.login(ADMIN, OTP)
        created = admin.post('/api/v1/bookings/', {
            'id': 'bk-crud-1', 'customerName': 'CRUD Customer', 'modelName': 'Pulsar N160', 'status': 'Pending',
            'tokenAmountPaise': 500000, 'customerPhone': '+91 98450 00001', 'colour': 'Red',
        }, format='json')
        self.assertEqual(created.status_code, 201, created.content)
        self.assertEqual(admin.get('/api/v1/bookings/bk-crud-1/').data['colour'], 'Red')
        edited = admin.patch('/api/v1/bookings/bk-crud-1/', {'customerName': 'CRUD Edited', 'colour': 'Blue'},
                             format='json')
        self.assertEqual((edited.data['customerName'], edited.data['colour']), ('CRUD Edited', 'Blue'))

        unit = VehicleUnit.objects.filter(tenant__slug='bike-erp', allocated_booking_id__isnull=True).first()
        admin.post(f'/api/v1/vehicles/{unit.ref}/allocate/', {'bookingId': 'bk-crud-1'}, format='json')
        self.assertEqual(admin.delete('/api/v1/bookings/bk-crud-1/').status_code, 204)
        unit.refresh_from_db()
        self.assertIsNone(unit.allocated_booking_id)  # chassis released with the booking
        self.assertEqual(unit.status, 'IN_STOCK')
        self.assertEqual(admin.get('/api/v1/bookings/bk-crud-1/').status_code, 404)

    def test_delivered_booking_cannot_be_deleted(self):
        admin, _ = self.login(ADMIN, OTP)
        admin.post('/api/v1/bookings/', {'id': 'bk-done', 'customerName': 'Done', 'status': 'Delivered'},
                   format='json')
        self.assertEqual(admin.delete('/api/v1/bookings/bk-done/').status_code, 400)
        self.assertTrue(Booking.objects.filter(ref='bk-done').exists())


class ServiceCrudTests(ApiTestCase):
    def book(self, client, **extra):
        body = {'customerName': 'Svc Customer', 'phone': '9845012345', 'registrationNumber': 'KA 05 MN 1111',
                'date': next_weekday().isoformat(), 'timeSlot': '13:30 - 14:30', **extra}
        return client.post('/api/v1/appointments/', body, format='json')

    def test_appointment_edit_and_delete(self):
        client, _ = self.login(SERVICE_ADVISOR)
        apt = self.book(client)
        self.assertEqual(apt.status_code, 201, apt.content)
        moved = client.patch(f"/api/v1/appointments/{apt.data['id']}/", {'timeSlot': '14:30 - 15:30',
                                                                          'customerName': 'Moved'}, format='json')
        self.assertEqual(moved.status_code, 200, moved.content)
        self.assertEqual(moved.data['timeSlot'], '14:30 - 15:30')
        self.assertEqual(client.delete(f"/api/v1/appointments/{apt.data['id']}/").status_code, 204)

    def test_job_card_edit_then_delete_frees_bay_and_reopens_appointment(self):
        client, _ = self.login(SERVICE_ADVISOR)
        apt = self.book(client, timeSlot='15:30 - 16:30')
        card = client.post('/api/v1/job-cards/', job_card_payload(appointmentId=apt.data['id']), format='json')
        self.assertEqual(card.status_code, 201, card.content)
        cid = card.data['id']
        # an appointment that became a job card cannot be deleted on its own
        self.assertEqual(client.delete(f"/api/v1/appointments/{apt.data['id']}/").status_code, 400)

        edited = client.patch(f'/api/v1/job-cards/{cid}/', {'remarks': 'Edited after check-in', 'priority': 'HIGH'},
                              format='json')
        self.assertEqual((edited.data['remarks'], edited.data['priority']), ('Edited after check-in', 'HIGH'))

        bay = Bay.objects.filter(tenant__slug='bike-erp', status='FREE').first()
        admin, _ = self.login(ADMIN, OTP)
        admin.post('/api/v1/bays/assign/', {'bayNumber': bay.bay_number, 'jobCardId': cid}, format='json')
        self.assertEqual(client.delete(f'/api/v1/job-cards/{cid}/').status_code, 204)
        bay.refresh_from_db()
        self.assertEqual(bay.status, 'FREE')
        reopened = ServiceAppointment.objects.get(ref=apt.data['id'])
        self.assertEqual((reopened.status, reopened.job_card_id), ('CONFIRMED', None))
        self.assertFalse(JobCard.objects.filter(ref=cid).exists())


class PaginationAndIndexTests(ApiTestCase):
    def test_pages_are_complete_and_stable(self):
        admin, _ = self.login(ADMIN, OTP)
        first = admin.get('/api/v1/invoices/?pageSize=25&page=1').data
        self.assertEqual(first['pageSize'], 25)
        self.assertEqual(first['page'], 1)
        self.assertGreater(first['totalPages'], 1)
        seen = []
        for page in range(1, first['totalPages'] + 1):
            seen += [r['id'] for r in admin.get(f'/api/v1/invoices/?pageSize=25&page={page}').data['results']]
        self.assertEqual(len(seen), first['count'])
        self.assertEqual(len(set(seen)), first['count'])  # no duplicates or gaps across pages
        self.assertEqual(admin.get('/api/v1/invoices/?pageSize=100000').data['pageSize'], 500)  # capped

    def test_ordering_and_filters_with_pagination(self):
        admin, _ = self.login(ADMIN, OTP)
        res = admin.get('/api/v1/bookings/?ordering=customer_name&pageSize=10').data
        names = [r['customerName'] for r in res['results']]
        self.assertEqual(names, sorted(names))

    def test_collection_pagination_is_opt_in(self):
        admin, _ = self.login(ADMIN, OTP)
        full = admin.get('/api/v1/collections/catalog.bikes/').data
        self.assertIsInstance(full, list)
        paged = admin.get('/api/v1/collections/catalog.bikes/?pageSize=2&page=1').data
        self.assertEqual(len(paged['results']), 2)
        self.assertEqual(paged['count'], len(full))

    def test_indexes_exist(self):
        with connection.cursor() as cursor:
            booking_indexes = connection.introspection.get_constraints(cursor, Booking._meta.db_table)
            card_indexes = connection.introspection.get_constraints(cursor, JobCard._meta.db_table)
        for name in ('bk_status_date', 'bk_date', 'bk_number'):
            self.assertIn(name, booking_indexes)
        for name in ('jc_stage_created', 'jc_reg', 'jc_appointment'):
            self.assertIn(name, card_indexes)

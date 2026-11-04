import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store';
import { getInitialSeedData } from '../data/seed';

describe('Booking and service CRUD actions', () => {
  beforeEach(() => {
    useAppStore.setState(getInitialSeedData());
  });

  it('creates a booking from the form fields (phone, colour, token, chassis)', () => {
    const state = useAppStore.getState();
    const unit = state.vehicleStock.find((u) => u.status === 'IN_STOCK' && !u.allocatedBookingId);
    const booking = state.addBooking({
      customerName: 'Form Customer',
      customerPhone: '+91 98450 22222',
      customerEmail: 'form@example.com',
      modelName: unit.modelName,
      variant: 'Disc',
      colour: 'Red',
      tokenPaidPaise: 500000,
      paymentMode: 'UPI',
      paymentRef: 'UPI-REAL-1',
      allocatedVin: unit.vin || unit.chassisNumber,
    });
    expect(booking.phone).toBe('+91 98450 22222');
    expect(booking.email).toBe('form@example.com');
    expect(booking.colorName).toBe('Red');
    expect(booking.variantName).toBe('Disc');
    expect(booking.tokenAmountPaise).toBe(500000);
    expect(booking.tokenPayments[0].reference).toBe('UPI-REAL-1');
    const allocated = useAppStore.getState().vehicleStock.find((u) => u.id === unit.id);
    expect(allocated.allocatedBookingId).toBe(booking.id);
  });

  it('edits and deletes a booking, releasing its chassis', () => {
    const state = useAppStore.getState();
    const unit = state.vehicleStock.find((u) => u.status === 'IN_STOCK' && !u.allocatedBookingId);
    const booking = state.addBooking({ customerName: 'To Delete', customerPhone: '9845022223', modelName: unit.modelName,
      allocatedVin: unit.vin || unit.chassisNumber });
    useAppStore.getState().updateBooking(booking.id, { customerName: 'Edited Name', colorName: 'Blue' });
    expect(useAppStore.getState().bookings.find((b) => b.id === booking.id).customerName).toBe('Edited Name');

    useAppStore.getState().deleteBooking(booking.id);
    const after = useAppStore.getState();
    expect(after.bookings.some((b) => b.id === booking.id)).toBe(false);
    expect(after.vehicleStock.find((u) => u.id === unit.id).allocatedBookingId).toBeNull();
  });

  it('refuses to delete a delivered booking', () => {
    const booking = useAppStore.getState().addBooking({ customerName: 'Delivered', customerPhone: '9845022224', status: 'Delivered' });
    expect(() => useAppStore.getState().deleteBooking(booking.id)).toThrow(/delivered/i);
  });

  it('deletes appointments, but not ones that became job cards', async () => {
    const apt = useAppStore.getState().appointments[0];
    const card = await useAppStore.getState().saveJobCard({ customerName: 'X', registrationNumber: apt.registrationNumber,
      stage: 'CHECKED_IN', appointmentId: apt.id });
    expect(() => useAppStore.getState().deleteAppointment(apt.id)).toThrow(/job card/i);

    // Deleting the job card reopens the appointment, which can then be deleted.
    useAppStore.getState().deleteJobCard(card.id);
    const reopened = useAppStore.getState().appointments.find((a) => a.id === apt.id);
    expect(reopened.status).toBe('CONFIRMED');
    expect(reopened.jobCardId).toBeNull();
    useAppStore.getState().deleteAppointment(apt.id);
    expect(useAppStore.getState().appointments.some((a) => a.id === apt.id)).toBe(false);
  });

  it('deleting a job card frees its bay', () => {
    const occupied = useAppStore.getState().bays.find((b) => b.activeJobCardId);
    const card = useAppStore.getState().jobCards.find((jc) => jc.id === occupied.activeJobCardId);
    useAppStore.setState((s) => ({ jobCards: s.jobCards.map((jc) => (jc.id === card.id ? { ...jc, stage: 'IN_PROGRESS' } : jc)) }));
    useAppStore.getState().deleteJobCard(card.id);
    const bay = useAppStore.getState().bays.find((b) => b.bayNumber === occupied.bayNumber && b.branchId === occupied.branchId);
    expect(bay.status).toBe('FREE');
    expect(bay.activeJobCardId).toBeNull();
  });
});

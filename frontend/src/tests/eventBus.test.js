import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventBus, ERP_EVENTS } from '../lib/events';

describe('EventBus Pub/Sub System', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('subscribes to events and receives published payloads', () => {
    const handler = vi.fn();
    const unsubscribe = eventBus.subscribe(ERP_EVENTS.BOOKING_CONFIRMED, handler);

    eventBus.publish(ERP_EVENTS.BOOKING_CONFIRMED, {
      bookingId: 'BK-BLR-2627-001',
      customerName: 'Rohan Mehta',
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ bookingId: 'BK-BLR-2627-001', customerName: 'Rohan Mehta' }),
      ERP_EVENTS.BOOKING_CONFIRMED,
      expect.any(String)
    );

    unsubscribe();
    eventBus.publish(ERP_EVENTS.BOOKING_CONFIRMED, { bookingId: 'BK-BLR-2627-002' });
    expect(handler).toHaveBeenCalledTimes(1); // handler not called again after unsubscribe
  });

  it('handles wildcard listeners across all event types', () => {
    const wildcardHandler = vi.fn();
    eventBus.subscribe('*', wildcardHandler);

    eventBus.publish(ERP_EVENTS.LEAD_CREATED, { leadId: 'lead-101' });
    eventBus.publish(ERP_EVENTS.QUOTATION_ACCEPTED, { quotationId: 'QT-001' });

    expect(wildcardHandler).toHaveBeenCalledTimes(2);
  });

  it('maintains recent event history', () => {
    eventBus.publish(ERP_EVENTS.INVOICE_POSTED, { invoiceNumber: 'VI/2627/00001' });
    eventBus.publish(ERP_EVENTS.PAYMENT_RECEIVED, { amountPaise: 2500000 });

    const history = eventBus.getHistory();
    expect(history.length).toBe(2);
    expect(history[0].eventName).toBe(ERP_EVENTS.PAYMENT_RECEIVED);
    expect(history[1].eventName).toBe(ERP_EVENTS.INVOICE_POSTED);
  });
});

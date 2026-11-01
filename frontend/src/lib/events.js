/**
 * AKASH BAJAJ ERP & Service Hub - Central Document Chain Event Bus
 * Pub/sub pattern with subscriptions, payload validation, event history, and wildcard listeners.
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.wildcardListeners = new Set();
    this.history = [];
    this.maxHistory = 100;
  }

  /**
   * Subscribe to a specific event or pattern
   * @param {string} eventName - e.g. 'booking.confirmed' or '*' for all
   * @param {Function} callback - listener receiving (payload, eventName, timestamp)
   * @returns {Function} unsubscribe function
   */
  subscribe(eventName, callback) {
    if (typeof callback !== 'function') {
      throw new Error(`EventBus subscribe requires a callback function, got ${typeof callback}`);
    }

    if (eventName === '*') {
      this.wildcardListeners.add(callback);
      return () => this.wildcardListeners.delete(callback);
    }

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    return () => {
      const set = this.listeners.get(eventName);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(eventName);
        }
      }
    };
  }

  /**
   * Publish an event to all subscribers
   * @param {string} eventName - e.g. 'quotation.accepted'
   * @param {Object} payload - event details
   */
  publish(eventName, payload = {}) {
    const timestamp = new Date().toISOString();
    const eventRecord = {
      eventName,
      payload,
      timestamp,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    // Store in history for debugging, replay, or audit
    this.history.unshift(eventRecord);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    // Notify specific listeners
    const specific = this.listeners.get(eventName);
    if (specific) {
      specific.forEach((callback) => {
        try {
          callback(payload, eventName, timestamp);
        } catch (err) {
          console.error(`[EventBus] Error in listener for "${eventName}":`, err);
        }
      });
    }

    // Notify wildcard listeners
    this.wildcardListeners.forEach((callback) => {
      try {
        callback(payload, eventName, timestamp);
      } catch (err) {
        console.error(`[EventBus] Error in wildcard listener for "${eventName}":`, err);
      }
    });

    return eventRecord;
  }

  /**
   * Get recent events log
   */
  getHistory(limit = 20) {
    return this.history.slice(0, limit);
  }

  /**
   * Clear all subscribers (useful in test teardown)
   */
  clear() {
    this.listeners.clear();
    this.wildcardListeners.clear();
    this.history = [];
  }
}

// Global Singleton Instance
export const eventBus = new EventBus();

// Strongly typed event constant names
export const ERP_EVENTS = {
  // Leads
  LEAD_CREATED: 'lead.created',
  LEAD_STAGE_CHANGED: 'lead.stage_changed',
  LEAD_CONVERTED: 'lead.converted',

  // Quotations
  QUOTATION_CREATED: 'quotation.created',
  QUOTATION_SENT: 'quotation.sent',
  QUOTATION_ACCEPTED: 'quotation.accepted',
  QUOTATION_EXPIRED: 'quotation.expired',

  // Bookings
  BOOKING_CREATED: 'booking.created',
  BOOKING_CONFIRMED: 'booking.confirmed',
  BOOKING_CHASSIS_ALLOCATED: 'booking.chassis_allocated',
  BOOKING_CANCELLED: 'booking.cancelled',

  // Sales Orders & PDI & Delivery
  SALES_ORDER_CREATED: 'sales_order.created',
  PDI_STARTED: 'pdi.started',
  PDI_COMPLETED: 'pdi.completed',
  PDI_REJECTED: 'pdi.rejected',
  DELIVERY_SCHEDULED: 'delivery.scheduled',
  DELIVERY_COMPLETED: 'delivery.completed',

  // Invoicing & Payments
  INVOICE_CREATED: 'invoice.created',
  INVOICE_POSTED: 'invoice.posted',
  INVOICE_CANCELLED: 'invoice.cancelled',
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Workshop & Service
  APPOINTMENT_SCHEDULED: 'appointment.scheduled',
  JOB_CARD_CREATED: 'job_card.created',
  JOB_CARD_STATUS_CHANGED: 'job_card.status_changed',
  JOB_CARD_COMPLETED: 'job_card.completed',
  BAY_OCCUPIED: 'bay.occupied',
  BAY_RELEASED: 'bay.released',

  // Inventory
  STOCK_MOVEMENT: 'inventory.movement',
  LOW_STOCK_ALERT: 'inventory.low_stock',

  // Approvals & Governance
  APPROVAL_REQUESTED: 'approval.requested',
  APPROVAL_APPROVED: 'approval.approved',
  APPROVAL_REJECTED: 'approval.rejected',
  AUDIT_LOGGED: 'audit.logged',
};

export default eventBus;

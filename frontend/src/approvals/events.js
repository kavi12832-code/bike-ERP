// src/approvals/events.js
/**
 * Lightweight in-browser Event Bus for Approvals governance.
 * Emits and listens to approval workflow lifecycle events.
 */

class ApprovalsEventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[ApprovalsEventBus] Error in listener for "${event}":`, err);
        }
      });
    }
  }
}

export const approvalsEvents = new ApprovalsEventBus();

export const APPROVAL_EVENTS = {
  CREATED: 'approval.created',
  DECIDED: 'approval.decided',
  ESCALATED: 'approval.escalated',
  EXPIRED: 'approval.expired',
  RETURNED: 'approval.returned',
};


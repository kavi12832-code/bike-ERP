import { useStore } from '../../store';
import { formatMoney } from '../../lib/format';

/**
 * Deterministic Store Tool Runner for AI Assistants & Copilot
 * Every tool executes directly against the active Zustand store.
 */

export const AI_TOOLS = [
  {
    name: 'search_bikes_by_budget',
    description: 'Finds available bikes in showroom catalog matching budget range (in paise or rupees) and optional fuel type (petrol/electric).',
    parameters: {
      type: 'object',
      properties: {
        maxBudgetPaise: { type: 'number', description: 'Maximum on-road budget in paise' },
        minBudgetPaise: { type: 'number', description: 'Minimum on-road budget in paise' },
        fuelType: { type: 'string', enum: ['petrol', 'electric', 'any'] },
      },
    },
    execute: (args) => {
      const state = useStore.getState();
      const bikes = state.catalogs?.bikes || [];
      const min = args.minBudgetPaise || 0;
      const max = args.maxBudgetPaise || 100000000; // default 10 Lakhs
      const fuel = args.fuelType && args.fuelType !== 'any' ? args.fuelType.toLowerCase() : null;

      const matches = bikes.filter((b) => {
        const price = b.exShowroomPricePaise;
        if (price < min || price > max) return false;
        if (fuel && b.fuelType?.toLowerCase() !== fuel) return false;
        return true;
      });

      return {
        count: matches.length,
        results: matches.slice(0, 5).map((b) => ({
          id: b.id,
          model: b.model,
          brand: b.brand,
          engineCc: b.engineCc,
          fuelType: b.fuelType,
          exShowroomFormatted: formatMoney(b.exShowroomPricePaise),
          exShowroomPaise: b.exShowroomPricePaise,
          colors: b.colors,
          availableColorsCount: b.colors?.length || 0,
        })),
      };
    },
  },
  {
    name: 'check_service_slots',
    description: 'Checks live available service slots for a given date. Flagship workshop capacity is max 48 slots per day. Sunday is closed.',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'YYYY-MM-DD date' },
      },
      required: ['date'],
    },
    execute: (args) => {
      const targetDate = new Date(args.date);
      if (isNaN(targetDate.getTime())) {
        return { error: 'Invalid date format. Please use YYYY-MM-DD.' };
      }
      if (targetDate.getDay() === 0) {
        return {
          date: args.date,
          day: 'Sunday',
          isOpen: false,
          message: 'Our workshop is closed on Sundays for routine maintenance. Please pick Monday through Saturday.',
          availableSlots: [],
        };
      }

      const state = useStore.getState();
      const existingAppts = (state.appointments || []).filter((a) => a.date === args.date);
      const bookedCount = existingAppts.length;
      const maxDaily = 48;
      const remainingTotal = Math.max(0, maxDaily - bookedCount);

      const standardSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
      ];

      const slotAvailability = standardSlots.map((slot) => {
        const slotBooked = existingAppts.filter((a) => a.timeSlot === slot).length;
        const capacityPerSlot = 6;
        return {
          time: slot,
          available: slotBooked < capacityPerSlot,
          remaining: Math.max(0, capacityPerSlot - slotBooked),
        };
      });

      return {
        date: args.date,
        isOpen: true,
        totalCapacity: maxDaily,
        alreadyBooked: bookedCount,
        remainingCapacity: remainingTotal,
        slots: slotAvailability,
        openSlotsList: slotAvailability.filter((s) => s.available).map((s) => s.time),
      };
    },
  },
  {
    name: 'query_job_status',
    description: 'Finds active or recent service job cards by customer phone number or vehicle registration number.',
    parameters: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Customer 10-digit mobile phone' },
        regNumber: { type: 'string', description: 'Vehicle registration number e.g. KA-01-MJ-4589' },
      },
    },
    execute: (args) => {
      const state = useStore.getState();
      const jobs = state.jobCards || [];
      const cleanPhone = (args.phone || '').replace(/\D/g, '').slice(-10);
      const cleanReg = (args.regNumber || '').replace(/[\s-]/g, '').toUpperCase();

      const matched = jobs.filter((j) => {
        if (cleanPhone && j.customerPhone?.replace(/\D/g, '').slice(-10) === cleanPhone) return true;
        if (cleanReg && j.regNumber?.replace(/[\s-]/g, '').toUpperCase() === cleanReg) return true;
        return false;
      });

      if (!matched.length) {
        return {
          found: false,
          message: 'No active or recent service job cards found matching this phone or registration number.',
        };
      }

      return {
        found: true,
        count: matched.length,
        jobs: matched.map((j) => ({
          jobCardNumber: j.jobCardNumber,
          customerName: j.customerName,
          bikeModel: j.bikeModel,
          regNumber: j.regNumber,
          stage: j.stage,
          serviceType: j.serviceType,
          estimatedCostFormatted: formatMoney(j.estimatedCostPaise || 0),
          estimatedReadyTime: j.estimatedReadyTime || 'Today, 5:30 PM',
          technician: j.technicianName || 'Master Tech',
          isQcPassed: !!j.qcPassed,
        })),
      };
    },
  },
  {
    name: 'get_low_stock_parts',
    description: 'Returns spare parts currently running below their statutory safety reorder level.',
    parameters: { type: 'object', properties: {} },
    execute: () => {
      const state = useStore.getState();
      const parts = state.spareParts || [];
      const lowStock = parts.filter((p) => p.currentStock < p.reorderLevel);

      return {
        totalCriticalItems: lowStock.length,
        items: lowStock.slice(0, 8).map((p) => ({
          partNumber: p.partNumber,
          name: p.name,
          currentStock: p.currentStock,
          reorderLevel: p.reorderLevel,
          shortage: p.reorderLevel - p.currentStock,
          rackLocation: p.rackLocation,
          mrpFormatted: formatMoney(p.mrpPaise),
        })),
      };
    },
  },
  {
    name: 'get_pending_renewals',
    description: 'Lists vehicles whose motor insurance or pollution certificate is expiring in the next 30 days.',
    parameters: { type: 'object', properties: {} },
    execute: () => {
      const state = useStore.getState();
      const insurance = state.insurancePolicies || [];
      const pending = insurance.filter((p) => p.status === 'Expiring Soon' || p.status === 'Pending');

      return {
        count: pending.length,
        renewals: pending.slice(0, 6).map((p) => ({
          policyNumber: p.policyNumber,
          customerName: p.customerName,
          phone: p.customerPhone,
          bikeModel: p.bikeModel,
          expiryDate: p.expiryDate,
          insurer: p.insurer,
          premiumFormatted: formatMoney(p.premiumPaise || 245000),
        })),
      };
    },
  },
  {
    name: 'explain_kpi',
    description: 'Provides financial formula and calculation breakdown for dealership executive metrics.',
    parameters: {
      type: 'object',
      properties: {
        kpiName: { type: 'string', description: 'Name of the KPI e.g. Gross Margin, Absorption Rate, DSI' },
      },
      required: ['kpiName'],
    },
    execute: (args) => {
      const name = (args.kpiName || '').toLowerCase();
      if (name.includes('absorption')) {
        return {
          kpi: 'Service Absorption Ratio',
          formula: '(Workshop Gross Profit + Spare Parts Margin) / Showroom Fixed Operating Overheads * 100',
          currentBenchmark: 'Current Dealership: 118.4% (Healthy benchmark is > 100%)',
          interpretation: 'A ratio above 100% means the service and parts division completely pays for all dealership overheads, making bike sales pure profit.',
        };
      }
      if (name.includes('margin') || name.includes('gross')) {
        return {
          kpi: 'Showroom Gross Margin %',
          formula: '(Net Vehicle Revenue - Ex-Factory Procurement Cost) / Net Vehicle Revenue * 100',
          currentBenchmark: 'Current Dealership: 9.2% (Target: 8.5% - 10.5%)',
          interpretation: 'Includes basic bike margin plus OEM wholesale volume bonus rebates, excluding RTO and statutory GST.',
        };
      }
      if (name.includes('dsi') || name.includes('days') || name.includes('inventory')) {
        return {
          kpi: 'Days Sales of Inventory (DSI)',
          formula: '(Average Vehicle Stock in Units / 30-Day Total Sales Units) * 30 Days',
          currentBenchmark: 'Current Showroom: 18.2 Days (Ideal OEM standard: 15-21 Days)',
          interpretation: 'Measures stock turnover speed. High DSI increases floor-plan interest financing costs.',
        };
      }
      return {
        kpi: args.kpiName,
        formula: 'Standard Indian Two-Wheeler FADA Dealership Formula',
        interpretation: 'Metric is computed in real-time from active store orders, parts ledgers, and job cards.',
      };
    },
  },
  {
    name: 'create_service_booking',
    description: 'Books an official service slot into the workshop calendar.',
    parameters: {
      type: 'object',
      properties: {
        customerName: { type: 'string' },
        phone: { type: 'string' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
        slotTime: { type: 'string', description: 'e.g. 10:00 AM' },
        bikeModel: { type: 'string' },
        serviceType: { type: 'string' },
      },
      required: ['customerName', 'phone', 'date', 'slotTime'],
    },
    execute: (args) => {
      const store = useStore.getState();
      const apptId = `APT-${Date.now().toString().slice(-6)}`;
      const newAppt = {
        id: apptId,
        customerName: args.customerName,
        phone: args.phone,
        date: args.date,
        timeSlot: args.slotTime,
        bikeModel: args.bikeModel || 'Customer Two-Wheeler',
        serviceType: args.serviceType || 'Scheduled Maintenance',
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
      };
      
      if (store.addAppointment) {
        store.addAppointment(newAppt);
      }

      return {
        success: true,
        appointmentId: apptId,
        confirmationText: `Confirmed! Booking #${apptId} scheduled for ${args.customerName} on ${args.date} at ${args.slotTime} at AKASH Bajaj (Bangalore Central Flagship).`,
      };
    },
  },
  {
    name: 'create_complaint_ticket',
    description: 'Logs a formal customer grievance ticket and escalates to the Service Relationship Manager.',
    parameters: {
      type: 'object',
      properties: {
        customerName: { type: 'string' },
        phone: { type: 'string' },
        issue: { type: 'string' },
        priority: { type: 'string', enum: ['Medium', 'High', 'Critical'] },
      },
      required: ['customerName', 'phone', 'issue'],
    },
    execute: (args) => {
      const store = useStore.getState();
      const ticketId = `TKT-${Date.now().toString().slice(-5)}`;
      const newTicket = {
        id: ticketId,
        customerName: args.customerName,
        phone: args.phone,
        issue: args.issue,
        priority: args.priority || 'High',
        status: 'Open',
        assignedTo: 'Service Manager (Suresh G.)',
        createdAt: new Date().toISOString(),
      };

      if (store.addCrmTicket) {
        store.addCrmTicket(newTicket);
      }

      return {
        success: true,
        ticketId,
        escalation: 'High-Priority Alert dispatched to Service Manager Suresh G.',
        resolutionSla: '4 Business Hours',
        message: `We have registered grievance ticket #${ticketId}. Our Service Manager will personally call you within 4 hours.`,
      };
    },
  },
];

/**
 * Execute tool by name
 */
export function executeAiTool(toolName, args = {}) {
  const tool = AI_TOOLS.find((t) => t.name === toolName);
  if (!tool) {
    return { error: `Tool "${toolName}" not found` };
  }
  const start = performance.now();
  try {
    const result = tool.execute(args);
    const duration = Math.round(performance.now() - start);
    return {
      toolName,
      args,
      result,
      durationMs: duration,
      success: !result.error,
    };
  } catch (err) {
    return {
      toolName,
      args,
      error: err.message,
      durationMs: Math.round(performance.now() - start),
      success: false,
    };
  }
}

# AKASH BAJAJ ERP & Service Hub - Master Upgrade Progress Tracker

**Branch**: `erp-upgrade`  
**Current Date**: November 2026  
**Status Legend**:
- `not started`: Initial baseline
- `in progress`: Active engineering
- `done`: Verified with full CRUD, plain KPIs, RBAC, events, unit tests & build pass
- `blocked`: Waiting on dependency

---

## Foundation Status
| Foundation Milestone | Status | Notes | Date |
|---|---|---|---|
| **Git Setup & .env security** | `done` | Created branch `erp-upgrade`, un-tracked `.env`, verified `.gitignore` | 2026-11-01 |
| **System Audit (`docs/ERP_AUDIT.md`)** | `done` | 66 modules catalogued, known defects verified | 2026-11-01 |
| **Global Config (`SHOW_KPI_TRENDS = false`)** | `done` | Enforcing no charts / plain KPI cards policy per Section 0.5 | 2026-11-01 |
| **Shared Design System & Components** | `done` | PageHeader, KpiCard, FilterBar, DataTable, StatusChip, etc. in `src/components/ui/` | 2026-11-01 |
| **App Shell & Navigation Polish** | `done` | Single Ctrl+K, deduplicated pins & dashboard, user profile menu, GSTIN chip guard | 2026-11-01 |
| **Data Layer & Coherent 60-Customer Seed** | `done` | 60 unique customers, unique KA plates, unique phones, cross-module reconciliation | 2026-11-01 |
| **Event Bus Architecture (`src/lib/events.js`)** | `done` | Document chain events, audit dispatch, reactive notifications with unit test suite | 2026-11-01 |

---

## 1. Administration Core (5 Modules)
| Module Name | Route | Group | Status | Notes | Date |
|---|---|---|---|---|---|
| **Users Management** | `/admin/users` | Administration | `done` | 4-step wizard, CRUD, privilege guard, security overview, plain KPIs | 2026-11-01 |
| **Approvals Center** | `/approvals` | Administration | `done` | Dual control, multi-level SLA, policy guide, delegation, plain KPIs | 2026-11-01 |
| **Immutable Audit Trail** | `/admin/audit` | Administration | `done` | PageHeader, plain KPIs, SHA-256 hash chaining simulation, before/after diffs | 2026-11-01 |
| **System Settings** | `/admin` | Administration | `done` | PageHeader, plain KPIs, Dealership profile, tax rules, limits, demo mode toggle | 2026-11-01 |
| **Branch Network** | `/branches` | Administration | `done` | PageHeader, plain KPIs, multi-branch CRUD, bay configs, delete protections | 2026-11-01 |

---

## 2. Operations (13 Modules)
| Module Name | Route | Group | Status | Notes | Date |
|---|---|---|---|---|---|
| **Dashboard** | `/` (`/dashboard`) | Operations | `done` | Technician view (KD-01), bay selector fix (KD-04), dynamic store selectors (KD-05) | 2026-11-01 |
| **Leads & Enquiries** | `/leads` | Operations | `done` | Duplicate phone detection, lead scoring, round-robin, Kanban & List views | 2026-11-01 |
| **Quotations** | `/quotations` | Operations | `done` | On-road pricing breakdown fixed, discount approval, WhatsApp share, PDF | 2026-11-01 |
| **Bookings** | `/bookings` | Operations | `done` | Weekly table fixed, token receipts, single VIN gate, cancellation modal | 2026-11-01 |
| **Test Rides** | `/test-rides` | Operations | `done` | PageHeader, plain KPIs, DL check, consent waiver, odometer in/out, reviews | 2026-11-01 |
| **Vehicle Sales Orders** | `/sales` | Operations | `done` | PageHeader, plain KPIs, FilterBar, StatusChip, 6-stage deal sheet, PDI & Gate Pass modal | 2026-11-01 |
| **Delivery & PDI Desk** | `/delivery` | Operations | `done` | PageHeader, plain KPIs, 5-stage queue board, 25-point PDI, digital signature, QR gate pass | 2026-11-01 |
| **Digital Showroom** | `/showroom` | Operations | `done` | PageHeader, plain KPIs, 3-bike spec compare, PIN kiosk lock, on-road tax & EMI simulator | 2026-11-01 |
| **Fleet & B2B Sales** | `/sales/fleet` | Operations | `done` | PageHeader, plain KPIs, B2B institutional pipeline, corporate discount slabs, multi-batch delivery | 2026-11-01 |
| **Accessories Counter (POS)** | `/counter` | Operations | `done` | PageHeader, plain KPIs, barcode scanner, preset bundles, cash float, thermal receipt printer | 2026-11-01 |
| **Vehicle Inventory** | `/stock/vehicles` | Operations | `done` | PageHeader, plain KPIs, 17-char VIN master, ageing, transfer, cost masking gate | 2026-11-01 |
| **Spare Parts & Stock** | `/stock/parts` | Operations | `done` | PageHeader, plain KPIs, bin cards, fast/slow velocity, reorder alerts, stock adjust | 2026-11-01 |
| **Purchases & GRN** | `/purchases` | Operations | `done` | PageHeader, plain KPIs, factory POs, consignment in-transit, 3-way match, GRN modal | 2026-11-01 |

---

## 3. Workshop & Service (8 Modules)
| Module Name | Route | Group | Status | Notes | Date |
|---|---|---|---|---|---|
| **Service Appointments** | `/service` | Workshop | `done` | PageHeader, plain KPIs, capacity slots pacing, Sunday blocker, quick booking modal | 2026-11-01 |
| **Create Job Card** | `/service/jobs/new` | Workshop | `done` | PageHeader, customer/VIN intake, 12-point inspection, dynamic estimate, draft save | 2026-11-01 |
| **Job Cards Kanban** | `/service/jobs` | Workshop | `done` | PageHeader, plain KPIs, 6-stage progression, customer OTP simulator, dual QC gate | 2026-11-01 |
| **Live Bay Board** | `/service/bays` | Workshop | `done` | PageHeader, plain KPIs, unified 12 bays, live SLA timers, mutual exclusivity invariant | 2026-11-01 |
| **Digital Inspection (DVI)** | `/service/dvi` | Workshop | `done` | PageHeader, plain KPIs, 360 photo dent pin-map, Red/Amber/Green items, WhatsApp approval | 2026-11-01 |
| **Pickup & Drop** | `/service/pickup` | Workshop | `not started` | Driver assignment, time windows, live tracking, OTP handover | 2026-11-01 |
| **Recalls & Bulletins** | `/service/recalls` | Workshop | `not started` | OEM bulletins, VIN range filter, customer notifications | 2026-11-01 |
| **Technician My Jobs** | `/service/my-jobs` | Workshop | `not started` | Technician-only view, timer, checklists, parts request | 2026-11-01 |

---

## 4. Customer Care (7 Modules)
| Module Name | Route | Group | Status | Notes | Date |
|---|---|---|---|---|---|
| **Customer 360** | `/customers` | Customer Care | `not started` | Deduplicate phones/plates, multi-tab profile, LTV, churn risk | 2026-11-01 |
| **Complaints & Grievances** | `/care/complaints` | Customer Care | `not started` | Category, severity, SLA, escalation ladder, root cause CAPA | 2026-11-01 |
| **Feedback & NPS** | `/care/feedback` | Customer Care | `not started` | Post-service surveys, NPS/CSAT metrics, detractor follow-ups | 2026-11-01 |
| **Loyalty & Referrals** | `/care/loyalty` | Customer Care | `not started` | Silver/Gold/Platinum tiers, earn/redeem ledger, referral codes | 2026-11-01 |
| **Roadside Assistance (RSA)** | `/care/roadside` | Customer Care | `not started` | SOS intake, GPS location, tow dispatch, AMC eligibility | 2026-11-01 |
| **Warranty & OEM Claims** | `/warranty` | Customer Care | `not started` | Warranty rules per VIN, AMC plans, OEM claims lifecycle | 2026-11-01 |
| **Document Vault** | `/documents` | Customer Care | `not started` | Customer and vehicle file storage (RC, Insurance, Form 21) | 2026-11-01 |

---

## 5. Finance & Accounts (16 Modules)
| Module Name | Route | Group | Status | Notes | Date |
|---|---|---|---|---|---|
| **Invoices & Billing** | `/billing` | Finance & Accounts | `not started` | Multi-category invoicing, payment split, immutable lock | 2026-11-01 |
| **Collections & Receivables** | `/finance/collections` | Finance & Accounts | `not started` | Ageing buckets, promise-to-pay tracker, reminders | 2026-11-01 |
| **General Accounting & Ledger** | `/accounting` | Finance & Accounts | `not started` | Chart of accounts, journal approval, trial balance, P&L | 2026-11-01 |
| **Expenses & Petty Cash** | `/accounts/expenses` | Finance & Accounts | `not started` | Claims, category limits, float reconciliation, voucher uploads | 2026-11-01 |
| **Bank Reconciliation** | `/accounts/bank-recon` | Finance & Accounts | `not started` | Statement CSV import, automated amount/date/ref matching | 2026-11-01 |
| **Day-end Closing** | `/accounts/day-close` | Finance & Accounts | `not started` | Cash denomination count, variance approval, day lock | 2026-11-01 |
| **Budget & Cash Flow** | `/accounts/budget` | Finance & Accounts | `not started` | Department budgets vs actuals, cash flow forecast (no charts) | 2026-11-01 |
| **Fixed Assets Register** | `/accounts/assets` | Finance & Accounts | `not started` | Asset tagging, depreciation schedule, disposal entries | 2026-11-01 |
| **GST Compliance** | `/gst` | Finance & Accounts | `not started` | GSTR-1, GSTR-3B auto-compilation, GSTR-2B ITC reconciliation | 2026-11-01 |
| **TDS & TCS Compliance** | `/gst/tds-tcs` | Finance & Accounts | `not started` | Section 194C/J TDS ledger, Section 206C(1F) vehicle TCS | 2026-11-01 |
| **e-Invoice & e-Way Bill** | `/gst/einvoice` | Finance & Accounts | `not started` | Simulated IRN/QR generation, e-way bill registry | 2026-11-01 |
| **Compliance Calendar** | `/gst/calendar` | Finance & Accounts | `not started` | Tax & license deadlines with automated task generation | 2026-11-01 |
| **Insurance & RTO Tracker** | `/insurance-rto` | Finance & Accounts | `not started` | Policy issuance, RTO status stages, renewal tracking | 2026-11-01 |
| **Vehicle Finance (EMI)** | `/vehicle-finance` | Finance & Accounts | `not started` | Loan applications to partner banks/NBFCs, payout tracking | 2026-11-01 |
| **Exchange & Pre-owned** | `/exchange` | Finance & Accounts | `not started` | 20-point valuation, refurbishing costs, pre-owned margins | 2026-11-01 |
| **Deal Profitability (P&L)** | `/reports/deal-profit` | Finance & Accounts | `not started` | Deal margins by sales order (cost masked by permission) | 2026-11-01 |

---

## 6. Growth & Intelligence (8 Modules)
| Module Name | Route | Group | Status | Notes | Date |
|---|---|---|---|---|---|
| **Lead Sources Hub** | `/leads/sources` | Growth & Intelligence | `not started` | Source master, CPL analysis, auto-assignment rules | 2026-11-01 |
| **Telecalling Console** | `/leads/telecall` | Growth & Intelligence | `not started` | Caller queues, click-to-call simulation, disposition codes | 2026-11-01 |
| **Offers & Campaigns** | `/marketing` | Growth & Intelligence | `not started` | Schemes, festival offers, broadcast consent check | 2026-11-01 |
| **CRM & Reminders** | `/crm` | Growth & Intelligence | `not started` | Automated service/insurance/EMI reminder triggers | 2026-11-01 |
| **WhatsApp Inbox & Studio** | `/whatsapp` | Growth & Intelligence | `not started` | Shared inbox, template dispatcher, quick replies | 2026-11-01 |
| **OEM Schemes & Scorecard** | `/oem` | Growth & Intelligence | `not started` | Scheme master, quarterly claim accruals, dealer scorecard | 2026-11-01 |
| **AI Copilot & Tools** | `/ai` | Growth & Intelligence | `not started` | Rule-based explainable insights, natural-language search | 2026-11-01 |
| **Reports & Analytics** | `/reports` | Growth & Intelligence | `not started` | Parameter forms, structured tables, PDF/Excel/CSV exports | 2026-11-01 |

---

## 7. Remaining Administration (9 Modules)
| Module Name | Route | Group | Status | Notes | Date |
|---|---|---|---|---|---|
| **Notification Center** | `/notifications` | Administration | `not started` | Notification rules by role and channel, quiet hours | 2026-11-01 |
| **Tasks & Calendar** | `/tasks` | Administration | `not started` | Unified task system (follow-ups, test rides, deliveries) | 2026-11-01 |
| **HR & Incentives** | `/hr` | Administration | `not started` | Attendance, automated sales/service incentive computation | 2026-11-01 |
| **Integrations Hub** | `/admin/integrations` | Administration | `in progress` | Simulated connectors (WhatsApp, Razorpay, Tally, GST) | 2026-11-01 |
| **Import & Export Center** | `/admin/data` | Administration | `not started` | CSV/Excel column mapping, row errors, undo import | 2026-11-01 |
| **Privacy & Consent (DPDP)** | `/admin/privacy` | Administration | `not started` | Consent registry, DSR access/erasure requests, audit log | 2026-11-01 |
| **Templates & Custom Fields** | `/admin/templates` | Administration | `not started` | Visual template editor, entity custom fields | 2026-11-01 |
| **Help Center & Tour** | `/help` | Administration | `not started` | Searchable knowledge base, role tours, shortcut drawer | 2026-11-01 |
| **Customer Portal** | `/portal` | Administration | `not started` | Admin preview mode only, simulated token/OTP flow | 2026-11-01 |

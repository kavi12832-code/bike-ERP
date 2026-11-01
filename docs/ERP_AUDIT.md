# AKASH BAJAJ ERP & Service Hub - Comprehensive System Audit

**Audit Date**: November 2026  
**Auditor**: Antigravity Pair-Programming Agent  
**Branch**: `erp-upgrade`  
**System Brand**: AKASH BAJAJ ERP & Service Hub  
**Stack**: React 19, Vite, Tailwind CSS, Zustand localStorage store, lucide-react, date-fns, sonner, i18next (EN, Tamil, Hindi)

---

## 1. Executive Summary & Audit Methodology

An exhaustive code audit was conducted across the 66 modules defined in [`src/config/navigation.js`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/config/navigation.js), router definitions in [`src/routes.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/routes.jsx), Zustand stores in [`src/store/index.js`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/store/index.js), and mock data sets.

The audit identifies:
1. Architectural and UI discrepancies against the production standard.
2. Hardcoded values and lack of universal CRUD operations.
3. Known defects enumerated in Section 1 of the upgrade specification.
4. Data reconciliation gaps across customers, vehicle VINs, bay allocations, and financial registers.

---

## 2. Review of Known Defects & Verification

| Defect ID | Reported Issue | Code Location | Verified Status & Finding |
|---|---|---|---|
| **KD-01** | Technician dashboard shows sales, GST, and AI revenue cards | [`src/features/dashboard/pages/DashboardPage.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/features/dashboard/pages/DashboardPage.jsx) | **Confirmed**: The default Dashboard renders financial KPIs (`totalRevenuePaise`, `grossMarginPaise`) regardless of role unless role-specific dashboards are rendered. |
| **KD-02** | Dashboard appears twice in the sidebar | [`src/components/layout/Sidebar.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/components/layout/Sidebar.jsx), [`src/config/navigation.js`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/config/navigation.js) | **Confirmed**: Pinned items default include Dashboard while the Operations group also includes Dashboard as the first item. |
| **KD-03** | Job Cards Kanban pinned and in a group | [`src/components/layout/Sidebar.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/components/layout/Sidebar.jsx) | **Confirmed**: Pinned items list contains `job_cards` statically in initial localStorage state, duplicating the Workshop group item. |
| **KD-04** | Bay utilisation shows 0 total bays while the board shows 12 | [`src/features/dashboard/components/MiniBayBoard.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/features/dashboard/components/MiniBayBoard.jsx), [`src/features/service/pages/LiveBaysPage.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/features/service/pages/LiveBaysPage.jsx) | **Partially Addressed**: `selectBayStats` exists in selectors, but some components still read `state.bays.length` without handling initial state properly. |
| **KD-05** | KPI cards on the dashboard are hardcoded | [`src/features/dashboard/components/DashboardKpiCards.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/features/dashboard/components/DashboardKpiCards.jsx) | **Confirmed**: Some cards had fallback constants and decorative trend percentages instead of plain metric values. |
| **KD-06** | Customer 360 has duplicate phone numbers (`+91 98450 12345`), all in "Bangalore", duplicate registration number | [`src/data/seed.js`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/data/seed.js), [`src/features/customers/pages/CustomersPage.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/features/customers/pages/CustomersPage.jsx) | **Confirmed**: Mock customers list in legacy seed has duplicate phone numbers, identical cities ("Bangalore"), and repeated registration strings. |
| **KD-07** | "Edit" and "Customer 360" actions styled inconsistently, no filters or pagination | [`src/features/customers/pages/CustomersPage.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/features/customers/pages/CustomersPage.jsx) | **Confirmed**: Action buttons in customer table had varying classes; filters for tier, churn risk, and pagination were basic. |
| **KD-08** | Both the sidebar and the header show a "Ctrl+K" hint | [`src/components/layout/Sidebar.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/components/layout/Sidebar.jsx), [`src/components/layout/Topbar.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/components/layout/Topbar.jsx) | **Confirmed**: Sidebar search input displays `Ctrl+K` and Topbar global search input also displays `Ctrl K`. |
| **KD-09** | Several sidebar labels are truncated | [`src/config/navigation.js`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/config/navigation.js), [`src/components/layout/Sidebar.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/components/layout/Sidebar.jsx) | **Confirmed**: Narrow sidebar without tooltips truncates "Warranty AMC and Claims", "General Accounting", "GST Compliance". |
| **KD-10** | Role dropdown in header looks like a demo switcher | [`src/components/layout/Topbar.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/components/layout/Topbar.jsx), [`RoleSwitcher.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/components/layout/RoleSwitcher.jsx) | **Confirmed**: Role switcher is currently rendered directly in the Topbar for all users. Must become a user profile menu, showing demo role switcher only in Demo mode for `super_admin`. |
| **KD-11** | Approvals Center sits in Administration but is a daily workflow | [`src/config/navigation.js`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/config/navigation.js) | **Confirmed**: Navigation group lists Approvals in Administration; needs deep linking and prominent badge visibility. |
| **KD-12** | Customer Portal and AI Copilot are visible to staff who do not need them | [`src/config/navigation.js`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/config/navigation.js), [`src/routes.jsx`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/routes.jsx) | **Confirmed**: Customer Portal is accessible in sidebar without restriction; AI Copilot has loose permission gates. |

---

## 3. Comprehensive Inventory of all 66 Modules

### Group 1: Operations (13 Modules)

| # | Module Name | Route | Current Status | Entities Read / Written | Deficiencies & Required Upgrades |
|---|---|---|---|---|---|
| 1 | **Dashboard** | `/` (`/dashboard`) | Basic | `leads`, `bookings`, `invoices`, `jobCards`, `bays` | Needs role-specific dashboards (technician, sales, advisor, manager). Remove charts on non-overview dashboards. Plain KPI cards. |
| 2 | **Leads & Enquiries** | `/leads` | Basic | `leads`, `tasks`, `users` | Implement duplicate detection by phone, lead scoring with reasons, assignment rules (round-robin), SLA timer, convert to quotation drawer. |
| 3 | **Quotations** | `/quotations` | Upgraded | `quotations`, `leads`, `catalogs.bikes` | Dynamic on-road price calculation fixed; add variant comparison, PDF/WhatsApp share simulation, discount approval dual-control gate. |
| 4 | **Bookings** | `/bookings` | Upgraded | `bookings`, `vehicleStock`, `receipts` | Activity table fixed; add full CRUD for booking management, advance receipt issuance, single-unit chassis allocation gate, refund workflow. |
| 5 | **Test Rides** | `/test-rides` | Basic | `testRides`, `vehicleStock`, `leads` | Calendar view by demo bike, driving license capture, consent tracking, odometer in/out logging, availability check. |
| 6 | **Vehicle Sales Orders** | `/sales` | Basic | `salesOrders`, `vehicleStock`, `bookings` | Safe catalog access fixed; add 6-step deal sheet, locked pricing, payment split (cash, UPI, card, finance, exchange), KYC checklist. |
| 7 | **Delivery & PDI Desk** | `/delivery` | Basic | `deliveries`, `jobCards`, `vehicleStock` | 5-stage queue board, 25-item checklist, document checklist, handover photo capture, digital signature, automatic invoice and warranty triggering. |
| 8 | **Digital Showroom** | `/showroom` | Basic | `catalogs.bikes`, `leads` | Interactive model catalogue, color switchers, EMI calculator, inquiry/booking lead creation form, staff editing mode. |
| 9 | **Fleet & B2B Sales** | `/sales/fleet` | Basic | `fleetAccounts`, `salesOrders` | Safe array reduce fixed; add corporate GST account management, bulk discount slabs, multi-VIN allocation, delivery batching. |
| 10 | **Accessories Counter (POS)** | `/counter` | Basic | `partsStock`, `invoices` | Fast SKU search, barcode scanning, bundle discounts, shift open/close with cash denomination count, stock deduction. |
| 11 | **Vehicle Inventory** | `/stock/vehicles` | Basic | `vehicleStock`, `branches` | 17-character VIN master, lifecycle status flow (ordered -> delivered), ageing buckets, yard locations, inter-branch stock transfers. |
| 12 | **Spare Parts & Stock** | `/stock/parts` | Basic | `partsStock`, `stockLedger` | OEM part master, HSN codes, bin locations, safety reorder thresholds, issue to job card, cost masking for technicians. |
| 13 | **Purchases & GRN** | `/purchases` | Basic | `purchaseOrders`, `grns`, `supplierBills` | PO management, GRN with VIN/lot capture, discrepancy flagging, 3-way matching (PO, GRN, bill). |

---

### Group 2: Workshop & Service (8 Modules)

| # | Module Name | Route | Current Status | Entities Read / Written | Deficiencies & Required Upgrades |
|---|---|---|---|---|---|
| 14 | **Service Appointments** | `/service` | Basic | `appointments`, `bays`, `customers` | Slot booking by bay and technician capacity, Sunday closure validation, walk-in scheduling, free-service check from VIN history. |
| 15 | **Create Job Card** | `/service/jobs/new` | Basic | `jobCards`, `customers`, `vehicles` | VIN lookup with auto-fill, odometer, fuel level, complaint checklist, inspection photo capture, promised delivery time. |
| 16 | **Job Cards Kanban** | `/service/jobs` | Basic | `jobCards`, `bays`, `users` | 8-stage drag & drop board, SLA timers, technician assignment, parts & labour requisitions, detail drawer. |
| 17 | **Live Bay Board** | `/service/bays` | Basic | `bays`, `jobCards` | Reconcile 12-bay layout with single store selector, drag-to-assign, occupancy tracking, live utilisation percentage. |
| 18 | **Digital Inspection (DVI)** | `/service/dvi` | Basic | `dviReports`, `jobCards` | Checklist templates by service type, red/amber/green ratings, photo uploads, supplementary estimate generation, customer approval token route. |
| 19 | **Pickup & Drop** | `/service/pickup` | Basic | `pickupRequests`, `users` | Driver assignment, pickup/drop time windows, live status tracker, fee calculation, handover OTP confirmation. |
| 20 | **Recalls & Bulletins** | `/service/recalls` | Basic | `recalls`, `vehicleStock`, `customers` | OEM bulletin entry, VIN range matching against registered fleet, customer notifications, warranty claim generation. |
| 21 | **Technician My Jobs** | `/service/my-jobs` | Basic | `jobCards`, `tasks` | Filter to logged-in technician only, task timer, job checklist, parts requisition request, QC submit; strictly mask all financial numbers. |

---

### Group 3: Customer Care (7 Modules)

| # | Module Name | Route | Current Status | Entities Read / Written | Deficiencies & Required Upgrades |
|---|---|---|---|---|---|
| 22 | **Customer 360** | `/customers` | Basic | `customers`, `vehicles`, `invoices` | Deduplicate phone numbers and registrations; add tabs (Profile, Vehicles, Timeline, Documents, Consents, Dues, Loyalty, Feedback); compute LTV. |
| 23 | **Complaints & Grievances** | `/care/complaints` | Basic | `complaints`, `customers` | Ticket categorisation, severity, SLA timer, escalation hierarchy, link to invoice/job card, root cause and corrective action (CAPA). |
| 24 | **Feedback & NPS** | `/care/feedback` | Basic | `feedback`, `customers` | Post-service and post-delivery survey logs, NPS/CSAT metrics, detractor follow-up task auto-creation. |
| 25 | **Loyalty & Referrals** | `/care/loyalty` | Basic | `loyaltyLedger`, `customers` | Silver/Gold/Platinum tiers, earn/redeem points ledger, referral reward codes, redemption at billing. |
| 26 | **Roadside Assistance (RSA)** | `/care/roadside` | Basic | `rsaRequests`, `customers` | SOS incident intake with GPS location, tow vehicle dispatch, SLA timer, plan coverage validation (AMC/RSA). |
| 27 | **Warranty, AMC & OEM Claims** | `/warranty` | Basic | `warranties`, `amcPlans`, `claims` | Policy rules per VIN, AMC package sales and renewals, claims from job cards, OEM claim status flow with receivable posting. |
| 28 | **Document Vault** | `/documents` | Basic | `documents`, `customers` | Secure customer and vehicle file storage (RC, Insurance, Form 21, KYC), expiry alerts, versioning, consent-based sharing. |

---

### Group 4: Finance & Accounts (16 Modules)

| # | Module Name | Route | Current Status | Entities Read / Written | Deficiencies & Required Upgrades |
|---|---|---|---|---|---|
| 29 | **Invoices & Billing** | `/billing` | Basic | `invoices`, `payments`, `customers` | Numbering series by branch and financial year, payment split, immutable once posted, PDF and WhatsApp receipt generation. |
| 30 | **Collections & Receivables** | `/finance/collections`| Basic | `receivables`, `customers` | Ageing buckets (0-30, 31-60, 61-90, 90+), promise-to-pay tracker, WhatsApp payment reminder templates, statement export. |
| 31 | **General Accounting & Ledger**| `/accounting` | Basic | `ledger`, `journals` | Chart of accounts, journal entries with dual-control approval, trial balance, P&L, balance sheet, period closing. |
| 32 | **Expenses & Petty Cash** | `/accounts/expenses` | Basic | `expenses`, `vouchers` | Expense claims with category limits, approval workflows, petty cash float, voucher receipts, input tax credit tagging. |
| 33 | **Bank Reconciliation** | `/accounts/bank-recon`| Basic | `bankStatements`, `ledger` | Statement CSV import, automated amount/date/reference matching, manual exception matching, variance report. |
| 34 | **Day-end Closing** | `/accounts/day-close` | Basic | `dayEndReports`, `invoices` | POS cash drawer tally, denomination counter, variance approval gate, day lock, daily managerial sign-off report. |
| 35 | **Budget & Cash Flow** | `/accounts/budget` | Basic | `budgets`, `ledger` | Department budgets vs actuals from general ledger, 30/60/90-day cash flow forecast presented in structured tables (no charts). |
| 36 | **Fixed Assets Register** | `/accounts/assets` | Basic | `fixedAssets`, `ledger` | Asset master, barcode/tag ID, location, custodian, SLM/WDV depreciation schedules, disposal journals. |
| 37 | **GST Compliance** | `/gst` | Basic | `invoices`, `purchases` | GSTR-1 and GSTR-3B auto-compilation, HSN summary, GSTR-2B ITC reconciliation against imported vendor data, JSON/CSV export. |
| 38 | **TDS & TCS Compliance** | `/gst/tds-tcs` | Basic | `taxRecords`, `invoices` | Section-based TDS rules (194C, 194J), TCS collection for vehicles exceeding statutory threshold (₹10 Lakh), challan log. |
| 39 | **e-Invoice & e-Way Bill** | `/gst/einvoice` | Basic | `invoices`, `eWayBills` | Simulated IRN & signed QR code generation, 24-hour cancellation window, e-way bill for inter-branch and inter-state movements (Demo label). |
| 40 | **Compliance Calendar** | `/gst/calendar` | Basic | `complianceDues`, `tasks` | Statutory tax deadlines, trade certificate renewals, PUC, showroom licensing due dates with automated task creation. |
| 41 | **Insurance & RTO Tracker** | `/insurance-rto` | Basic | `insuranceRecords`, `rtoCases` | Insurance policy issuance (IDV, premium, commission), RTO stages (fee, HSRP, RC delivery), expiry renewal reminders. |
| 42 | **Vehicle Finance (EMI)** | `/vehicle-finance` | Basic | `financeApplications`, `leads` | Loan applications to partner banks/NBFCs, document checklist, status tracking, subvention and commission payout tracking. |
| 43 | **Exchange & Pre-owned** | `/exchange` | Basic | `exchangeVehicles`, `stock` | 20-point bike evaluation, refurb cost estimation, exchange bonus approval, pre-owned inventory listing and margins. |
| 44 | **Deal Profitability (P&L)**| `/reports/deal-profit` | Basic | `salesOrders`, `invoices` | Deal profitability per vehicle (ex-showroom, discounts, accessories, insurance payout, finance subvention), restricted by permission. |

---

### Group 5: Growth & Intelligence (8 Modules)

| # | Module Name | Route | Current Status | Entities Read / Written | Deficiencies & Required Upgrades |
|---|---|---|---|---|---|
| 45 | **Lead Sources Hub** | `/leads/sources` | Basic | `leadSources`, `leads` | Source master (Walk-in, Digital, Social, Meta, Referral), CPL analysis, conversion rates, auto-assignment rules. |
| 46 | **Telecalling Console** | `/leads/telecall` | Basic | `telecallQueue`, `leads` | Daily calling queue per executive, click-to-call simulation (`tel:`), disposition codes, call duration logging, DND verification. |
| 47 | **Offers & Campaigns** | `/marketing` | Basic | `campaigns`, `offers` | Promotional schemes, festival discounts, accessory packages, budget limits, simulated WhatsApp/SMS broadcast with consent check. |
| 48 | **CRM & Reminders** | `/crm` | Basic | `reminders`, `customers` | Rule-based automated triggers (service due, insurance expiry, anniversary, EMI reminder), opt-out handling, timeline log. |
| 49 | **WhatsApp Inbox & Studio** | `/whatsapp` | Basic | `waConversations`, `templates` | Unified team inbox, lead/customer quick linking, approved HSM template sender, quick replies, AI response suggestions. |
| 50 | **OEM Schemes & Scorecard** | `/oem` | Basic | `oemSchemes`, `scorecard` | OEM incentive slabs, target vs achievement, quarterly claim accruals, CSI/SSI/TAT dealer scorecard metrics. |
| 51 | **AI Copilot & Tools** | `/ai` | Basic | Read-only across store | Explainable rule-based insights (demand forecast, churn alerts, stock reorders), natural language queries, staff role scoping. |
| 52 | **Reports & Analytics** | `/reports` | Basic | Multi-entity | Structured parameter forms, report catalog (sales, service, finance, inventory), saved views, export (PDF, Excel, CSV). |

---

### Group 6: Administration (14 Modules)

| # | Module Name | Route | Current Status | Entities Read / Written | Deficiencies & Required Upgrades |
|---|---|---|---|---|---|
| 53 | **Approvals Center** | `/approvals` | Upgraded | `approvals`, `customApprovalRules` | Policy engine with versioned rules, dual control enforcement (maker cannot be checker), SLA in business hours, delegation, bulk approvals. |
| 54 | **Users Management** | `/admin/users` | Upgraded | `users`, `customRoles` | Plain KPI cards, staff drawer, 4-step Add Staff wizard, privilege escalation guard, protection of last super admin, security overview. |
| 55 | **Immutable Audit Trail** | `/admin/audit` | Basic | `auditLogs` | Append-only log with SHA-256 hash chaining simulation, before/after JSON diff viewer, user/module filters, audit export. |
| 56 | **Notification Center** | `/notifications` | Basic | `notifications` | Notification rules by role and channel, quiet hours, per-user inbox, read/unread states, simulated SMS/WhatsApp dispatch. |
| 57 | **Tasks & Calendar** | `/tasks` | Basic | `tasks`, `users` | Unified task system (follow-ups, test rides, deliveries, appointments), list/board/calendar views, assignments, priority filters. |
| 58 | **HR & Incentives** | `/hr` | Basic | `staff`, `incentives`, `attendance` | Attendance log, target tracking, automated incentive calculation from vehicle/service completions, payroll approval run. |
| 59 | **Branch Network** | `/branches` | Upgraded | `branches`, `vehicleStock` | Multi-branch CRUD, GSTIN assignment, bay configuration, inter-branch stock transfers with simulated e-way bill generation. |
| 60 | **Integrations Hub** | `/admin/integrations` | Upgraded | `externalIntegrations` | Connectors (WhatsApp Business, Payment Gateway, Tally Prime, GST Portal, OEM API), key masking, webhook simulator. |
| 61 | **Import & Export Center** | `/admin/data` | Basic | Multi-entity | CSV/Excel upload with column auto-mapping, row-level validation errors, duplicate handling, atomic rollback, export masking. |
| 62 | **Privacy & Consent (DPDP)** | `/admin/privacy` | Basic | `consents`, `auditLogs` | Digital Personal Data Protection Act compliance, consent registry by purpose, data subject access/erasure requests, breach register. |
| 63 | **Templates & Custom Fields** | `/admin/templates` | Basic | `templates`, `customFields` | Document templates (Quotation, Invoice, Job Card), custom field engine applied to real entity forms. |
| 64 | **System Settings** | `/admin` | Upgraded | `dealership`, `settings` | Dealership profile, tax rules, numbering series, discount approval thresholds, working hours, feature flags (Demo Mode). |
| 65 | **Help Center & Tour** | `/help` | Basic | Static help | Searchable knowledge base, role-based onboarding tours, keyboard shortcut reference card. |
| 66 | **Customer Portal** | `/portal` | Basic | `customers`, `jobCards` | Admin preview mode only, simulated customer access via token/OTP for job card approval, service status, and invoice downloads. |

---

## 4. Architectural Baseline & Execution Strategy

To fulfill Section 0 and Section 2-6:
1. **Config Flag**: Set `SHOW_KPI_TRENDS = false` in [`src/config/constants.js`](file:///d:/bike%20ERP%20gitdesktop/bike-ERP/frontend/src/config/constants.js) and remove charts from all regular module pages.
2. **Shared Foundation**:
   * Build unified UI components: `PageHeader`, `KpiCard` (plain), `FilterBar`, `DataTable` (sortable, search, column picker, bulk actions, pagination), `StatusChip`, `Drawer`, `Modal`, `ConfirmDialog`, `MoneyText`, `DateText`, `PermissionGate`.
   * Standardize layout: deduplicate Dashboard in sidebar, single `Ctrl+K` command palette, role switcher visible only in Demo mode for `super_admin`, profile menu for normal users.
3. **Normalized Seed Data**:
   * 60 unique customers with verified Indian phone numbers (`+91 9...`), realistic KA registration numbers (`KA-01-AB-1234`), diverse Karnataka cities (Bangalore, Mysore, Hubli, Mangalore, Belgaum), unique VINs, and consistent cross-module references.
4. **Incremental Upgrade Order**:
   * **Batch 1**: Global Foundation (Design System, App Shell, RBAC, Single Event Bus, Seed Data reconciliation).
   * **Batch 2**: Administration Core (Users Management, Approvals Center, Audit Trail, System Settings, Branch Network).
   * **Batch 3**: Operations (Leads, Quotations, Bookings, Test Rides, Vehicle Sales Orders).
   * **Batch 4**: Operations (Delivery & PDI Desk, Digital Showroom, Fleet Sales, Accessories POS, Vehicle Inventory, Spare Parts, Purchases).
   * **Batch 5**: Workshop & Service (Appointments, Job Card Creation, Kanban, Bay Board, DVI, Pickup & Drop, Recalls, Technician My Jobs).
   * **Batch 6**: Customer Care (Customer 360, Complaints, Feedback NPS, Loyalty, RSA, Warranty & Claims, Document Vault).
   * **Batch 7**: Finance & Accounts (Invoices, Collections, Accounting Ledger, Expenses, Bank Recon, Day-end, Budget, Assets).
   * **Batch 8**: Finance & Accounts (GST Compliance, TDS/TCS, e-Invoice/e-Way, Compliance Calendar, Insurance/RTO, Vehicle Finance, Exchange, Deal Profitability).
   * **Batch 9**: Growth & Intelligence (Lead Sources, Telecalling, Campaigns, CRM, WhatsApp, OEM Schemes, AI Copilot, Reports).
   * **Batch 10**: Remaining Administration & Final Polish (Notification Center, Tasks, HR & Incentives, Integrations, Data Exchange, Privacy DPDP, Templates, Help Center, Customer Portal).

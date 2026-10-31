import { RouteErrorBoundary } from './components/layout/RouteErrorBoundary';
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { RouteGuard } from './app/RouteGuard';
import { PERMISSIONS } from './config/permissions';

// Auth & Shell Pages
import { LoginPage } from './features/auth/pages/LoginPage';
import CustomerPortalPage from './features/portal/CustomerPortalPage';
import DviCustomerApprovalPage from './features/service/pages/DviCustomerApprovalPage';

// Operations
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { LeadsPage } from './features/leads/pages/LeadsPage';
import { QuotationsPage } from './features/quotations/pages/QuotationsPage';
import { BookingsPage } from './features/bookings/pages/BookingsPage';
import { TestRidesPage } from './features/testRides/pages/TestRidesPage';
import { SalesOrdersPage } from './features/sales/pages/SalesOrdersPage';
import DeliveryDeskPage from './features/delivery/pages/DeliveryDeskPage';
import DigitalShowroomPage from './features/showroom/pages/DigitalShowroomPage';
import FleetSalesPage from './features/sales/pages/FleetSalesPage';
import AccessoriesCounterPage from './features/counter/pages/AccessoriesCounterPage';
import { VehicleStockPage } from './features/stockVehicles/pages/VehicleStockPage';
import { SparePartsPage } from './features/stockParts/pages/SparePartsPage';
import { PurchasesPage } from './features/purchases/pages/PurchasesPage';

// Workshop
import { AppointmentsPage } from './features/service/pages/AppointmentsPage';
import { JobCardsKanbanPage } from './features/service/pages/JobCardsKanbanPage';
import JobCardCreatePage from './features/service/pages/JobCardCreatePage';
import { LiveBaysPage } from './features/service/pages/LiveBaysPage';
import DviPage from './features/service/pages/DviPage';
import PickupDropPage from './features/service/pages/PickupDropPage';
import RecallsPage from './features/service/pages/RecallsPage';
import { TechnicianMyJobsPage } from './features/service/pages/TechnicianMyJobsPage';

// Customer Care
import { CustomersPage } from './features/customers/pages/CustomersPage';
import ComplaintsPage from './features/care/pages/ComplaintsPage';
import FeedbackNpsPage from './features/care/pages/FeedbackNpsPage';
import LoyaltyReferralsPage from './features/care/pages/LoyaltyReferralsPage';
import RoadsideAssistancePage from './features/care/pages/RoadsideAssistancePage';
import { WarrantyAmcPage } from './features/warranty/pages/WarrantyAmcPage';
import DocumentVaultPage from './features/documents/pages/DocumentVaultPage';

// Finance & Accounts
import { BillingPage } from './features/billing/pages/BillingPage';
import CollectionsReceivablesPage from './features/finance/pages/CollectionsReceivablesPage';
import { AccountingPage } from './features/accounting/pages/AccountingPage';
import ExpensesPettyCashPage from './features/accounting/pages/ExpensesPettyCashPage';
import BankReconciliationPage from './features/accounting/pages/BankReconciliationPage';
import DayEndClosingPage from './features/accounting/pages/DayEndClosingPage';
import BudgetCashFlowPage from './features/accounting/pages/BudgetCashFlowPage';
import FixedAssetsPage from './features/accounting/pages/FixedAssetsPage';
import { GstCompliancePage } from './features/gst/pages/GstCompliancePage';
import TdsTcsCompliancePage from './features/gst/pages/TdsTcsCompliancePage';
import EInvoiceWayBillPage from './features/gst/pages/EInvoiceWayBillPage';
import ComplianceCalendarPage from './features/gst/pages/ComplianceCalendarPage';
import { InsuranceRtoPage } from './features/insurance/pages/InsuranceRtoPage';
import { VehicleFinancePage } from './features/vehicleFinance/pages/VehicleFinancePage';
import { ExchangePage } from './features/exchange/pages/ExchangePage';
import DealProfitabilityPage from './features/reports/pages/DealProfitabilityPage';

// Growth & Intelligence
import LeadSourcesPage from './features/leads/pages/LeadSourcesPage';
import TelecallingConsolePage from './features/leads/pages/TelecallingConsolePage';
import { MarketingCampaignsPage } from './features/marketing/pages/MarketingCampaignsPage';
import { CrmRemindersPage } from './features/crm/pages/CrmRemindersPage';
import { WhatsAppPage } from './features/whatsapp/pages/WhatsAppPage';
import OemScorecardPage from './features/oem/pages/OemScorecardPage';
import AiSuitePage from './features/ai/AiSuitePage';
import WhatsAppSimulatorPage from './features/ai/WhatsAppSimulatorPage';
import AiCopilotPage from './features/ai/AiCopilotPage';
import OcrStudioPage from './features/ai/OcrStudioPage';
import NlqReportsPage from './features/ai/NlqReportsPage';
import { ReportsPage } from './features/reports/pages/ReportsPage';

// Administration & Settings
import ApprovalsPage from './features/approvals/pages/ApprovalsPage';
import UsersPage from './features/admin/pages/UsersPage';
import RolesPage from './features/admin/pages/RolesPage';
import AuditPage from './features/admin/pages/AuditPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import AdminNotificationsPage from './features/notifications/pages/AdminNotificationsPage';
import TasksCalendarPage from './features/tasks/pages/TasksCalendarPage';
import { HrIncentivesPage } from './features/hr/pages/HrIncentivesPage';
import { BranchesPage } from './features/branches/pages/BranchesPage';
import IntegrationsHubPage from './features/admin/pages/IntegrationsHubPage';
import DataExchangePage from './features/admin/pages/DataExchangePage';
import PrivacyConsentPage from './features/admin/pages/PrivacyConsentPage';
import TemplatesCustomFieldsPage from './features/admin/pages/TemplatesCustomFieldsPage';
import AdminSecurityPage from './features/admin/AdminSecurityPage';
import { TaxRulesPage } from './features/admin/pages/TaxRulesPage';
import HelpCenterPage from './features/help/pages/HelpCenterPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/portal',
    element: <CustomerPortalPage />,
  },
  {
    path: '/dvi/:token',
    element: <DviCustomerApprovalPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      // Operations
      {
        path: 'leads',
        element: (
          <RouteGuard permission={PERMISSIONS.LEAD_VIEW_OWN}>
            <LeadsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'leads/sources',
        element: (
          <RouteGuard permission={PERMISSIONS.LEAD_SOURCES_MANAGE}>
            <LeadSourcesPage />
          </RouteGuard>
        ),
      },
      {
        path: 'leads/telecall',
        element: (
          <RouteGuard permission={PERMISSIONS.TELECALL_MANAGE}>
            <TelecallingConsolePage />
          </RouteGuard>
        ),
      },
      {
        path: 'quotations',
        element: (
          <RouteGuard permission={PERMISSIONS.QUOTATION_VIEW}>
            <QuotationsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'bookings',
        element: (
          <RouteGuard permission={PERMISSIONS.BOOKING_VIEW}>
            <BookingsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'test-rides',
        element: (
          <RouteGuard permission={PERMISSIONS.LEAD_VIEW_OWN}>
            <TestRidesPage />
          </RouteGuard>
        ),
      },
      {
        path: 'sales',
        element: (
          <RouteGuard permission={PERMISSIONS.DELIVERY_MANAGE}>
            <SalesOrdersPage />
          </RouteGuard>
        ),
      },
      {
        path: 'delivery',
        element: (
          <RouteGuard permission={PERMISSIONS.DELIVERY_MANAGE}>
            <DeliveryDeskPage />
          </RouteGuard>
        ),
      },
      {
        path: 'showroom',
        element: (
          <RouteGuard permission={PERMISSIONS.SHOWROOM_VIEW}>
            <DigitalShowroomPage />
          </RouteGuard>
        ),
      },
      {
        path: 'sales/fleet',
        element: (
          <RouteGuard permission={PERMISSIONS.FLEET_MANAGE}>
            <FleetSalesPage />
          </RouteGuard>
        ),
      },
      {
        path: 'counter',
        element: (
          <RouteGuard permission={PERMISSIONS.COUNTER_POS}>
            <AccessoriesCounterPage />
          </RouteGuard>
        ),
      },
      {
        path: 'stock/vehicles',
        element: (
          <RouteGuard permission={PERMISSIONS.VEHICLE_STOCK_VIEW}>
            <VehicleStockPage />
          </RouteGuard>
        ),
      },
      {
        path: 'stock/parts',
        element: (
          <RouteGuard permission={PERMISSIONS.PARTS_VIEW}>
            <SparePartsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'purchases',
        element: (
          <RouteGuard permission={PERMISSIONS.PURCHASE_CREATE}>
            <PurchasesPage />
          </RouteGuard>
        ),
      },

      // Workshop
      {
        path: 'service',
        element: (
          <RouteGuard permission={PERMISSIONS.SERVICE_APPOINTMENTS_MANAGE}>
            <AppointmentsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'service/jobs/new',
        element: (
          <RouteGuard permission={PERMISSIONS.JOBCARD_CREATE}>
            <JobCardCreatePage />
          </RouteGuard>
        ),
      },
      {
        path: 'service/jobs',
        element: (
          <RouteGuard permission={PERMISSIONS.JOBCARD_VIEW_OWN}>
            <JobCardsKanbanPage />
          </RouteGuard>
        ),
      },
      {
        path: 'service/bays',
        element: (
          <RouteGuard permission={PERMISSIONS.BAY_MANAGE}>
            <LiveBaysPage />
          </RouteGuard>
        ),
      },
      {
        path: 'service/dvi',
        element: (
          <RouteGuard permission={PERMISSIONS.DVI_VIEW}>
            <DviPage />
          </RouteGuard>
        ),
      },
      {
        path: 'service/pickup',
        element: (
          <RouteGuard permission={PERMISSIONS.PICKUP_MANAGE}>
            <PickupDropPage />
          </RouteGuard>
        ),
      },
      {
        path: 'service/recalls',
        element: (
          <RouteGuard permission={PERMISSIONS.RECALLS_MANAGE}>
            <RecallsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'service/my-jobs',
        element: (
          <RouteGuard permission={PERMISSIONS.JOBCARD_VIEW_OWN}>
            <TechnicianMyJobsPage />
          </RouteGuard>
        ),
      },

      // Customer Care
      {
        path: 'customers',
        element: (
          <RouteGuard permission={PERMISSIONS.CUSTOMER_VIEW}>
            <CustomersPage />
          </RouteGuard>
        ),
      },
      {
        path: 'care/complaints',
        element: (
          <RouteGuard permission={PERMISSIONS.COMPLAINTS_MANAGE}>
            <ComplaintsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'care/feedback',
        element: (
          <RouteGuard permission={PERMISSIONS.FEEDBACK_VIEW}>
            <FeedbackNpsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'care/loyalty',
        element: (
          <RouteGuard permission={PERMISSIONS.LOYALTY_MANAGE}>
            <LoyaltyReferralsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'care/roadside',
        element: (
          <RouteGuard permission={PERMISSIONS.ROADSIDE_MANAGE}>
            <RoadsideAssistancePage />
          </RouteGuard>
        ),
      },
      {
        path: 'warranty',
        element: (
          <RouteGuard permission={PERMISSIONS.WARRANTY_MANAGE}>
            <WarrantyAmcPage />
          </RouteGuard>
        ),
      },
      {
        path: 'documents',
        element: (
          <RouteGuard permission={PERMISSIONS.DOCUMENTS_VIEW}>
            <DocumentVaultPage />
          </RouteGuard>
        ),
      },

      // Finance & Accounts
      {
        path: 'billing',
        element: (
          <RouteGuard permission={PERMISSIONS.INVOICE_CREATE}>
            <BillingPage />
          </RouteGuard>
        ),
      },
      {
        path: 'finance/collections',
        element: (
          <RouteGuard permission={PERMISSIONS.COLLECTIONS_MANAGE}>
            <CollectionsReceivablesPage />
          </RouteGuard>
        ),
      },
      {
        path: 'accounting',
        element: (
          <RouteGuard permission={PERMISSIONS.ACCOUNTS_VIEW}>
            <AccountingPage />
          </RouteGuard>
        ),
      },
      {
        path: 'accounts/expenses',
        element: (
          <RouteGuard permission={PERMISSIONS.EXPENSES_MANAGE}>
            <ExpensesPettyCashPage />
          </RouteGuard>
        ),
      },
      {
        path: 'accounts/bank-recon',
        element: (
          <RouteGuard permission={PERMISSIONS.BANK_RECON_MANAGE}>
            <BankReconciliationPage />
          </RouteGuard>
        ),
      },
      {
        path: 'accounts/day-close',
        element: (
          <RouteGuard permission={PERMISSIONS.DAY_CLOSE_MANAGE}>
            <DayEndClosingPage />
          </RouteGuard>
        ),
      },
      {
        path: 'accounts/budget',
        element: (
          <RouteGuard permission={PERMISSIONS.BUDGET_MANAGE}>
            <BudgetCashFlowPage />
          </RouteGuard>
        ),
      },
      {
        path: 'accounts/assets',
        element: (
          <RouteGuard permission={PERMISSIONS.ASSETS_MANAGE}>
            <FixedAssetsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'gst',
        element: (
          <RouteGuard permission={PERMISSIONS.ACCOUNTS_VIEW}>
            <GstCompliancePage />
          </RouteGuard>
        ),
      },
      {
        path: 'gst/tds-tcs',
        element: (
          <RouteGuard permission={PERMISSIONS.ACCOUNTS_VIEW}>
            <TdsTcsCompliancePage />
          </RouteGuard>
        ),
      },
      {
        path: 'gst/einvoice',
        element: (
          <RouteGuard permission={PERMISSIONS.ACCOUNTS_VIEW}>
            <EInvoiceWayBillPage />
          </RouteGuard>
        ),
      },
      {
        path: 'gst/calendar',
        element: (
          <RouteGuard permission={PERMISSIONS.ACCOUNTS_VIEW}>
            <ComplianceCalendarPage />
          </RouteGuard>
        ),
      },
      {
        path: 'insurance-rto',
        element: (
          <RouteGuard permission={PERMISSIONS.INSURANCE_MANAGE}>
            <InsuranceRtoPage />
          </RouteGuard>
        ),
      },
      {
        path: 'vehicle-finance',
        element: (
          <RouteGuard permission={PERMISSIONS.FINANCE_MANAGE}>
            <VehicleFinancePage />
          </RouteGuard>
        ),
      },
      {
        path: 'exchange',
        element: (
          <RouteGuard permission={PERMISSIONS.EXCHANGE_MANAGE}>
            <ExchangePage />
          </RouteGuard>
        ),
      },
      {
        path: 'reports/deal-profit',
        element: (
          <RouteGuard permission={PERMISSIONS.COST_VIEW}>
            <DealProfitabilityPage />
          </RouteGuard>
        ),
      },

      // Growth & Intelligence
      {
        path: 'marketing',
        element: (
          <RouteGuard permission={PERMISSIONS.CAMPAIGN_CREATE}>
            <MarketingCampaignsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'crm',
        element: (
          <RouteGuard permission={PERMISSIONS.CUSTOMER_VIEW}>
            <CrmRemindersPage />
          </RouteGuard>
        ),
      },
      {
        path: 'whatsapp',
        element: (
          <RouteGuard permission={PERMISSIONS.WA_VIEW}>
            <WhatsAppPage />
          </RouteGuard>
        ),
      },
      {
        path: 'oem',
        element: (
          <RouteGuard permission={PERMISSIONS.OEM_SCHEMES_VIEW}>
            <OemScorecardPage />
          </RouteGuard>
        ),
      },
      {
        path: 'ai',
        element: (
          <RouteGuard permission={PERMISSIONS.AI_USE}>
            <AiSuitePage />
          </RouteGuard>
        ),
      },
      {
        path: 'ai/whatsapp-simulator',
        element: (
          <RouteGuard permission={PERMISSIONS.AI_USE}>
            <WhatsAppSimulatorPage />
          </RouteGuard>
        ),
      },
      {
        path: 'ai/copilot',
        element: (
          <RouteGuard permission={PERMISSIONS.AI_USE}>
            <AiCopilotPage />
          </RouteGuard>
        ),
      },
      {
        path: 'ai/ocr',
        element: (
          <RouteGuard permission={PERMISSIONS.AI_USE}>
            <OcrStudioPage />
          </RouteGuard>
        ),
      },
      {
        path: 'ai/reports',
        element: (
          <RouteGuard permission={PERMISSIONS.AI_USE}>
            <NlqReportsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'reports',
        element: (
          <RouteGuard permission={PERMISSIONS.REPORT_VIEW}>
            <ReportsPage />
          </RouteGuard>
        ),
      },

      // Administration & Settings
      {
        path: 'approvals',
        element: (
          <RouteGuard permission={PERMISSIONS.APPROVALS_VIEW_OWN}>
            <ApprovalsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <RouteGuard permission={PERMISSIONS.USERS_VIEW}>
            <UsersPage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/roles',
        element: (
          <RouteGuard permission={PERMISSIONS.ROLES_MANAGE}>
            <RolesPage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/audit',
        element: (
          <RouteGuard permission={PERMISSIONS.AUDIT_VIEW}>
            <AuditPage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/audit-log',
        element: (
          <RouteGuard permission={PERMISSIONS.AUDIT_VIEW}>
            <AuditPage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/notifications',
        element: (
          <RouteGuard permission={PERMISSIONS.SETTINGS_MANAGE}>
            <AdminNotificationsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'tasks',
        element: (
          <RouteGuard permission={PERMISSIONS.TASKS_MANAGE}>
            <TasksCalendarPage />
          </RouteGuard>
        ),
      },
      {
        path: 'hr',
        element: (
          <RouteGuard permission={PERMISSIONS.HR_VIEW_OWN}>
            <HrIncentivesPage />
          </RouteGuard>
        ),
      },
      {
        path: 'branches',
        element: (
          <RouteGuard permission={PERMISSIONS.SETTINGS_MANAGE}>
            <BranchesPage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/integrations',
        element: (
          <RouteGuard permission={PERMISSIONS.SETTINGS_MANAGE}>
            <IntegrationsHubPage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/data',
        element: (
          <RouteGuard permission={PERMISSIONS.DATA_EXCHANGE_MANAGE}>
            <DataExchangePage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/import-export',
        element: (
          <RouteGuard permission={PERMISSIONS.DATA_EXCHANGE_MANAGE}>
            <DataExchangePage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/privacy',
        element: (
          <RouteGuard permission={PERMISSIONS.PRIVACY_MANAGE}>
            <PrivacyConsentPage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/templates',
        element: (
          <RouteGuard permission={PERMISSIONS.TEMPLATES_MANAGE}>
            <TemplatesCustomFieldsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin',
        element: (
          <RouteGuard permission={PERMISSIONS.SETTINGS_MANAGE}>
            <AdminSecurityPage />
          </RouteGuard>
        ),
      },
      {
        path: 'admin/tax-rules',
        element: (
          <RouteGuard permission={PERMISSIONS.SETTINGS_MANAGE}>
            <TaxRulesPage />
          </RouteGuard>
        ),
      },
      {
        path: 'help',
        element: <HelpCenterPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

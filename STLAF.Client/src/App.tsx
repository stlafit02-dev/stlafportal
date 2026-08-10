import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./auth/AuthProvider";
import { LandingPage } from "./landing/LandingPage";
import { ProtectedRoute } from "./common/components/ProtectedRoute";
import { DepartmentGuard } from "./common/components/DepartmentGuard";
import { ModuleGuard } from "./common/components/ModuleGuard";

import { ItDashboard } from "./departments/it/ItDashboard";
import { ItOverviewPage } from "./departments/it/ItOverviewPage";
import { HrDashboard } from "./departments/hr-admin/HrDashboard";
import { HrOverviewPage } from "./departments/hr-admin/HrOverviewPage";
import { LitigationDashboard } from "./departments/litigation/LitigationDashboard";
import { AccountingDashboard } from "./departments/accounting/AccountingDashboard";
import { CorporateDashboard } from "./departments/corporate/CorporateDashboard";
import { MarketingDashboard } from "./departments/marketing/MarketingDashboard";
import { PartnerDashboard } from "./departments/partner/PartnerDashboard";
import { ITHelpdeskPage } from "./departments/it/ticketing/ITHelpdeskPage";
import { AssetPublicPage } from "./departments/it/assets/AssetPublicPage";
import { TicketingPage } from "./departments/it/ticketing/TicketingPage";
import { AssetManagementPage } from "./departments/it/assets/AssetManagementPage";
import { GwsAccountPage } from "./departments/it/gmail/GwsAccountPage";
import { EmailAccountPage } from "./departments/it/gmail/EmailAccountPage";
import { AppPasswordPage } from "./departments/it/gmail/AppPasswordPage";
import { EmployeesPage } from "./departments/hr-admin/employees/EmployeesPage";
import { LeaveSettingsPage } from "./departments/hr-admin/leave-settings/LeaveSettingsPage";
import { ReportsPage } from "./departments/hr-admin/reports/ReportsPage";
import { MedicalVerificationsPage } from "./departments/hr-admin/medical/MedicalVerificationsPage";
import { IdleLogoutWatcher } from "./auth/IdleLogoutWatcher";
import { MyLeavePage } from "./common/leave/MyLeavePage";
import { MyOvertimePage } from "./common/leave/MyOvertimePage";
import { MyUndertimePage } from "./common/leave/MyUndertimePage";
import { ApprovalsPage } from "./common/leave/ApprovalsPage";
import { FinalApprovalsPage } from "./common/leave/FinalApprovalsPage";
import { TicketModalProvider } from "./common/tickets/TicketModalProvider";

function LeaveRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="my-leave" replace />} />
      <Route path="my-leave" element={<MyLeavePage />} />
      <Route path="overtime" element={<MyOvertimePage />} />
      <Route path="undertime" element={<MyUndertimePage />} />
      <Route path="approvals" element={<ApprovalsPage />} />
      <Route path="final-approvals" element={<FinalApprovalsPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketModalProvider>
          <BrowserRouter>
            <IdleLogoutWatcher />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/it-helpdesk" element={<ITHelpdeskPage />} />
              <Route path="/assets/:assetTag" element={<AssetPublicPage />} />

              {/* ---------- IT ---------- */}
              <Route
                path="/it"
                element={
                  <ProtectedRoute>
                    <DepartmentGuard department="IT">
                      <ItDashboard />
                    </DepartmentGuard>
                  </ProtectedRoute>
                }
              >
                <Route index element={<ItOverviewPage />} />
                <Route
                  path="ticketing"
                  element={
                    <ModuleGuard module="it-ticketing">
                      <TicketingPage />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="assets"
                  element={
                    <ModuleGuard module="it-assets">
                      <AssetManagementPage />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="gmail"
                  element={<Navigate to="accounts" replace />}
                />
                <Route
                  path="gmail/accounts"
                  element={
                    <ModuleGuard module="it-gmail">
                      <GwsAccountPage />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="gmail/emails"
                  element={
                    <ModuleGuard module="it-gmail">
                      <EmailAccountPage />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="gmail/app-passwords"
                  element={
                    <ModuleGuard module="it-gmail">
                      <AppPasswordPage />
                    </ModuleGuard>
                  }
                />
                <Route path="leave/*" element={<LeaveRoutes />} />
              </Route>

              {/* ---------- HR Admin ---------- */}
              <Route
                path="/hr-admin"
                element={
                  <ProtectedRoute>
                    <DepartmentGuard department="HRAdmin">
                      <HrDashboard />
                    </DepartmentGuard>
                  </ProtectedRoute>
                }
              >
                <Route index element={<HrOverviewPage />} />
                <Route
                  path="employees"
                  element={
                    <ModuleGuard module="hr-employees">
                      <EmployeesPage />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="leave-settings"
                  element={
                    <ModuleGuard module="hr-leave-settings">
                      <LeaveSettingsPage />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ModuleGuard module="hr-reports">
                      <ReportsPage />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="medical-certificates"
                  element={
                    <ModuleGuard module="hr-medical-certificates">
                      <MedicalVerificationsPage />
                    </ModuleGuard>
                  }
                />
                <Route path="leave/*" element={<LeaveRoutes />} />
              </Route>

              {/* ---------- Litigation ---------- */}
              <Route
                path="/litigation"
                element={
                  <ProtectedRoute>
                    <DepartmentGuard department="Litigation">
                      <LitigationDashboard />
                    </DepartmentGuard>
                  </ProtectedRoute>
                }
              >
                <Route path="leave/*" element={<LeaveRoutes />} />
              </Route>

              {/* ---------- Accounting ---------- */}
              <Route
                path="/accounting"
                element={
                  <ProtectedRoute>
                    <DepartmentGuard department="Accounting">
                      <AccountingDashboard />
                    </DepartmentGuard>
                  </ProtectedRoute>
                }
              >
                <Route path="leave/*" element={<LeaveRoutes />} />
              </Route>

              {/* ---------- Corporate ---------- */}
              <Route
                path="/corporate"
                element={
                  <ProtectedRoute>
                    <DepartmentGuard department="Corporate">
                      <CorporateDashboard />
                    </DepartmentGuard>
                  </ProtectedRoute>
                }
              >
                <Route path="leave/*" element={<LeaveRoutes />} />
              </Route>

              {/* ---------- Marketing ---------- */}
              <Route
                path="/marketing"
                element={
                  <ProtectedRoute>
                    <DepartmentGuard department="Marketing">
                      <MarketingDashboard />
                    </DepartmentGuard>
                  </ProtectedRoute>
                }
              >
                <Route path="leave/*" element={<LeaveRoutes />} />
              </Route>

              {/* ---------- Partner ---------- */}
              <Route
                path="/partner"
                element={
                  <ProtectedRoute>
                    <DepartmentGuard department="Partner">
                      <PartnerDashboard />
                    </DepartmentGuard>
                  </ProtectedRoute>
                }
              >
                <Route path="leave/*" element={<LeaveRoutes />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TicketModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

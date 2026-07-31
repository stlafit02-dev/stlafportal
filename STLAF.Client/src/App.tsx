import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./auth/AuthProvider";
import { LandingPage } from "./landing/LandingPage";
import { ProtectedRoute } from "./common/components/ProtectedRoute";
import { DepartmentGuard } from "./common/components/DepartmentGuard";

import { ItDashboard } from "./departments/it/ItDashboard";
import { HrDashboard } from "./departments/hr-admin/HrDashboard";
import { LitigationDashboard } from "./departments/litigation/LitigationDashboard";
import { AccountingDashboard } from "./departments/accounting/AccountingDashboard";
import { CorporateDashboard } from "./departments/corporate/CorporateDashboard";
import { MarketingDashboard } from "./departments/marketing/MarketingDashboard";
import { ITHelpdeskPage } from "./departments/it/ticketing/ITHelpdeskPage";
import { AssetPublicPage } from "./departments/it/assets/AssetPublicPage";
import { TicketingPage } from "./departments/it/ticketing/TicketingPage";
import { AssetManagementPage } from "./departments/it/assets/AssetManagementPage";
import { GwsAccountPage } from "./departments/it/gmail/GwsAccountPage";
import { EmailAccountPage } from "./departments/it/gmail/EmailAccountPage";
import { AppPasswordPage } from "./departments/it/gmail/AppPasswordPage";
import { EmployeesPage } from "./departments/hr-admin/employees/EmployeesPage";
import { PortalLeaveRoute } from "./common/leave/PortalLeaveRoute";
import { LeaveSettingsPage } from "./departments/hr-admin/leave-settings/LeaveSettingsPage";
import { IdleLogoutWatcher } from "./auth/IdleLogoutWatcher";
import { MyLeavePage } from "./common/leave/MyLeavePage";
import { MyOvertimePage } from "./common/leave/MyOvertimePage";
import { ApprovalsPage } from "./common/leave/ApprovalsPage";
import { FinalApprovalsPage } from "./common/leave/FinalApprovalsPage";
import { ReportsPage } from "./departments/hr-admin/reports/ReportsPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <IdleLogoutWatcher />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/it-helpdesk" element={<ITHelpdeskPage />} />
            <Route path="/assets/:assetTag" element={<AssetPublicPage />} />
            <Route
              path="/dashboard/leave"
              element={
                <ProtectedRoute>
                  <PortalLeaveRoute />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="my-leave" replace />} />
              <Route path="my-leave" element={<MyLeavePage />} />
              <Route path="overtime" element={<MyOvertimePage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="final-approvals" element={<FinalApprovalsPage />} />
            </Route>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DepartmentGuard department="IT">
                    <ItDashboard />
                  </DepartmentGuard>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="ticketing" replace />} />
              <Route path="ticketing" element={<TicketingPage />} />
              <Route path="assets" element={<AssetManagementPage />} />
              <Route
                path="gmail"
                element={<Navigate to="accounts" replace />}
              />
              <Route path="gmail/accounts" element={<GwsAccountPage />} />
              <Route path="gmail/emails" element={<EmailAccountPage />} />
              <Route path="gmail/app-passwords" element={<AppPasswordPage />} />
            </Route>
            <Route
              path="/dashboard/hr-admin"
              element={
                <ProtectedRoute>
                  <DepartmentGuard department="HRAdmin">
                    <HrDashboard />
                  </DepartmentGuard>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="employees" replace />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="leave-settings" element={<LeaveSettingsPage />} />
               <Route path="reports" element={<ReportsPage />} />
            </Route>
            <Route
              path="/dashboard/litigation"
              element={
                <ProtectedRoute>
                  <DepartmentGuard department="Litigation">
                    <LitigationDashboard />
                  </DepartmentGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/accounting"
              element={
                <ProtectedRoute>
                  <DepartmentGuard department="Accounting">
                    <AccountingDashboard />
                  </DepartmentGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/corporate"
              element={
                <ProtectedRoute>
                  <DepartmentGuard department="Corporate">
                    <CorporateDashboard />
                  </DepartmentGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/marketing"
              element={
                <ProtectedRoute>
                  <DepartmentGuard department="Marketing">
                    <MarketingDashboard />
                  </DepartmentGuard>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { Navigate } from "react-router-dom";
import { TicketingPage } from "./departments/it/ticketing/TicketingPage";
import { AssetManagementPage } from "./departments/it/assets/AssetManagementPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/it-helpdesk" element={<ITHelpdeskPage />} />
            <Route path="/assets/:assetTag" element={<AssetPublicPage />} />

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
                element={
                  <div>
                    <h1 className="page-title">Gmail Management</h1>
                    <p className="page-subtitle">Coming soon.</p>
                  </div>
                }
              />
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
            />
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

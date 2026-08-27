import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./auth/AuthProvider";
import { useAuth } from "./auth/useAuth";
import { ProtectedRoute } from "./common/components/ProtectedRoute";
import { PageLoader } from "./common/components/Loader/Loader";
import { LoginPage } from "./auth/LoginPage";
import { SignupPage } from "./auth/SignupPage";
import { AuthenticatedLayout } from "./common/layout/AuthenticatedLayout";
import { PortalWizardPage } from "./portal/PortalWizardPage";
import { RedeemPage } from "./subscription/RedeemPage";
import { LandingPage } from "./landing/LandingPage";

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader label="Loading…" />;
  if (isAuthenticated) return <Navigate to="/portal" replace />;
  return <LandingPage />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <PortalWizardPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/redeem"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <RedeemPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

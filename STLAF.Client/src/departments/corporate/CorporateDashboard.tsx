import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";
import { useAuth } from "../../auth/useAuth";
import { useModuleAccessPositions } from "../../common/access/useModuleAccess";
import { useApprovalStatus } from "../../common/leave/useApprovalStatus";

export function CorporateDashboard() {
  const { user } = useAuth();
  const { positions } = useModuleAccessPositions();
  const location = useLocation();
  const isOverview = location.pathname === "/corporate";
  const { showApprovals, showFinalApprovals } = useApprovalStatus();

  return (
    <DashboardLayout
      departmentLabel="Corporate Department"
      navItems={buildNavItems(
        "Corporate",
        user?.role,
        user?.officePosition ?? undefined,
        positions,
        showApprovals,
        showFinalApprovals,
      )}
    >
      {isOverview ? (
        <div className="gmail-page">
          <div className="gmail-page-header">
            <div>
              <h1 className="page-title">
                Welcome, {user?.fullName?.split(" ")[0] ?? "there"}
              </h1>
              <p className="page-subtitle">Corporate Department</p>
            </div>
          </div>
          <div className="ls-empty">
            Use the sidebar to submit a ticket or manage your leave and
            overtime.
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </DashboardLayout>
  );
}

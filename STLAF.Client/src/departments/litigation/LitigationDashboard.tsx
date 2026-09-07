import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";
import { useAuth } from "../../auth/useAuth";
import { useModuleAccessPositions } from "../../common/access/useModuleAccess";
import { useApprovalStatus } from "../../common/leave/useApprovalStatus";
import { useClientPortalAdminAccess } from "../../common/client-portal-admin/useClientPortalAdminAccess";
import { DashboardWireframe } from "../../common/components/DashboardWireframe/DashboardWireframe";
import { LastTicketCard } from "../../common/tickets/LastTicketCard";

export function LitigationDashboard() {
  const { user } = useAuth();
  const { positions } = useModuleAccessPositions();
  const location = useLocation();
  const isOverview = location.pathname === "/litigation";
  const { showApprovals, showFinalApprovals, showMyInquiries } = useApprovalStatus();
  const { hasAccess: showClientPortalAdmin } = useClientPortalAdminAccess();

  return (
    <DashboardLayout
      departmentLabel="Litigation Department"
      navItems={buildNavItems(
        "Litigation",
        user?.role,
        user?.officePosition ?? undefined,
        positions,
        showApprovals,
        showFinalApprovals,
        showMyInquiries,
        showClientPortalAdmin,
      )}
    >
      {isOverview ? (
        <div className="gmail-page overview-page-fill">
          <div className="gmail-page-header">
            <div>
              <h1 className="page-title">
                Welcome, {user?.fullName?.split(" ")[0] ?? "there"}
              </h1>
              <p className="page-subtitle">Litigation Department</p>
            </div>
          </div>
          <DashboardWireframe side={<LastTicketCard />} />
        </div>
      ) : (
        <Outlet />
      )}
    </DashboardLayout>
  );
}

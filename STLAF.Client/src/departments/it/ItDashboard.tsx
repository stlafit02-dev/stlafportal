import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";
import { useAuth } from "../../auth/useAuth";
import { useModuleAccessPositions } from "../../common/access/useModuleAccess";
import { useApprovalStatus } from "../../common/leave/useApprovalStatus";
import { useClientPortalAdminAccess } from "../../common/client-portal-admin/useClientPortalAdminAccess";

export function ItDashboard() {
  const { user } = useAuth();
  const { positions } = useModuleAccessPositions();
  const { showApprovals, showFinalApprovals, showMyInquiries } = useApprovalStatus();
  const { hasAccess: showClientPortalAdmin } = useClientPortalAdminAccess();

  return (
    <DashboardLayout
      departmentLabel="IT Department"
      navItems={buildNavItems(
        "IT",
        user?.role,
        user?.officePosition ?? undefined,
        positions,
        showApprovals,
        showFinalApprovals,
        showMyInquiries,
        showClientPortalAdmin,
      )}
    >
      <Outlet />
    </DashboardLayout>
  );
}

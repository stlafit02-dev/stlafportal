import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";
import { useAuth } from "../../auth/useAuth";
import { useModuleAccessPositions } from "../../common/access/useModuleAccess";
import { useApprovalStatus } from "../../common/leave/useApprovalStatus";
import { useClientPortalAdminAccess } from "../../common/client-portal-admin/useClientPortalAdminAccess";

export function HrDashboard() {
  const { user } = useAuth();
  const { positions } = useModuleAccessPositions();
  const { showApprovals, showFinalApprovals, showMyInquiries } = useApprovalStatus();
  const { hasAccess: showClientPortalAdmin } = useClientPortalAdminAccess();

  return (
    <DashboardLayout
      departmentLabel="HR Admin Department"
      navItems={buildNavItems(
        "HRAdmin",
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

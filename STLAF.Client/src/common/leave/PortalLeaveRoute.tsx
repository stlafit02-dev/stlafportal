import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout/DashboardLayout";
import { useAuth } from "../../auth/useAuth";
import { buildNavItems } from "../navConfig";
import { useModuleAccessPositions } from "../access/useModuleAccess";
import { useApprovalStatus } from "./useApprovalStatus";
import { useClientPortalAdminAccess } from "../client-portal-admin/useClientPortalAdminAccess";

export function PortalLeaveRoute() {
  const { user } = useAuth();
  const { positions } = useModuleAccessPositions();
  const { showApprovals, showFinalApprovals, showMyInquiries } = useApprovalStatus();
  const { hasAccess: showClientPortalAdmin } = useClientPortalAdminAccess();
  const department = user?.department ?? "IT";

  return (
    <DashboardLayout
      departmentLabel={`${department} Department`}
      navItems={buildNavItems(
        department,
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
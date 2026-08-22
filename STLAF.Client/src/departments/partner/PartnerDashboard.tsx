import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";
import { useAuth } from "../../auth/useAuth";
import { useModuleAccessPositions } from "../../common/access/useModuleAccess";
import { useApprovalStatus } from "../../common/leave/useApprovalStatus";

export function PartnerDashboard() {
  const { user } = useAuth();
  const { positions } = useModuleAccessPositions();
  const { showApprovals, showFinalApprovals, showMyInquiries } = useApprovalStatus();  

  return (
    <DashboardLayout
      departmentLabel="Partner"
      navItems={buildNavItems(
        "Partner",
        user?.role,
        user?.officePosition ?? undefined,
        positions,
        showApprovals,
        showFinalApprovals,
        showMyInquiries
      )}
    >
      <Outlet />
    </DashboardLayout>
  );
}
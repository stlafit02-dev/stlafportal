import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";
import { useAuth } from "../../auth/useAuth";
import { useModuleAccessPositions } from "../../common/access/useModuleAccess";

export function PartnerDashboard() {
  const { user } = useAuth();
  const { positions } = useModuleAccessPositions();

  return (
    <DashboardLayout
      departmentLabel="Partner"
      navItems={buildNavItems(
        "Partner",
        user?.role,
        user?.officePosition ?? undefined,
        positions,
        false,
        false,
      )}
    >
      <Outlet />
    </DashboardLayout>
  );
}
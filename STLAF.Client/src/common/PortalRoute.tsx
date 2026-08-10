import type { ReactNode } from "react";
import { DashboardLayout } from "./components/DashboardLayout/DashboardLayout";
import { useAuth } from "../auth/useAuth";
import { buildNavItems } from "./navConfig";
import { useModuleAccessPositions } from "./access/useModuleAccess";
import { useApprovalStatus } from "./leave/useApprovalStatus";

export function PortalRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { positions } = useModuleAccessPositions();
  const { showApprovals, showFinalApprovals } = useApprovalStatus();
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
      )}
    >
      {children}
    </DashboardLayout>
  );
}
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout/DashboardLayout";
import { useAuth } from "../../auth/useAuth";
import { buildNavItems } from "../navConfig";

export function PortalLeaveRoute() {
  const { user } = useAuth();
  const department = user?.department ?? "IT";

  return (
    <DashboardLayout departmentLabel={`${department} Department`} navItems={buildNavItems(department)}>
      <Outlet />
    </DashboardLayout>
  );
}
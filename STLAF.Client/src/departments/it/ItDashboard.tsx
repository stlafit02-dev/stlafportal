import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";

export function ItDashboard() {
  return (
    <DashboardLayout departmentLabel="IT Department" navItems={buildNavItems("IT")}>
      <Outlet />
    </DashboardLayout>
  );
}
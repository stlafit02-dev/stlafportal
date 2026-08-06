import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";

export function HrDashboard() {
  return (
    <DashboardLayout departmentLabel="HR Admin Department" navItems={buildNavItems("HRAdmin")}>
      <Outlet />
    </DashboardLayout>
  );
}
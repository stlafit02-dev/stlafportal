import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";

export function HrDashboard() {
  return (
    <DashboardLayout
      departmentLabel="HR Admin Department"
      navItems={[
        { label: "Employees", to: "/dashboard/hr-admin/employees" },
        { label: "Leave Settings", to: "/dashboard/hr-admin/leave-settings" },
        { label: "Leave", to: "/dashboard/leave" },
      ]}
    >
      <Outlet />
    </DashboardLayout>
  );
}
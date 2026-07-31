import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";

export function HrDashboard() {
  return (
    <DashboardLayout
      departmentLabel="HR Admin Department"
      navItems={[
        { label: "Employees", to: "/dashboard/hr-admin/employees" },
        { label: "Leave Settings", to: "/dashboard/hr-admin/leave-settings" },
        { label: "Reports", to: "/dashboard/hr-admin/reports" },
        {
          label: "Leave & Overtime",
          children: [
            { label: "My Leave", to: "/dashboard/leave/my-leave" },
            { label: "My Overtime", to: "/dashboard/leave/overtime" },
            { label: "Approvals", to: "/dashboard/leave/approvals" },
            {
              label: "Final Approvals",
              to: "/dashboard/leave/final-approvals",
            },
          ],
        },
      ]}
    >
      <Outlet />
    </DashboardLayout>
  );
}

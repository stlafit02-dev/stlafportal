import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";

export function CorporateDashboard() {
  return (
    <DashboardLayout
      departmentLabel="Corporate Department"
      navItems={[
        { label: "Employees", to: "/dashboard/corporate" },
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
      <h1 className="page-title">Corporate</h1>
      <p className="page-subtitle">
        Modules for this department are coming soon.
      </p>
    </DashboardLayout>
  );
}

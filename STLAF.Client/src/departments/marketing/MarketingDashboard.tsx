import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";

export function MarketingDashboard() {
  return (
    <DashboardLayout
      departmentLabel="Marketing Department"
      navItems={[
        { label: "Employees", to: "/dashboard/marketing" },
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
      <h1 className="page-title">Marketing</h1>
      <p className="page-subtitle">
        Modules for this department are coming soon.
      </p>
    </DashboardLayout>
  );
}

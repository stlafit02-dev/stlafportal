import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";

export function CorporateDashboard() {
  return (
    <DashboardLayout
      departmentLabel="Corporate Department"
      navItems={[{ label: "Employees", to: "/dashboard/corporate" },
        { label: "Leave", to: "/dashboard/leave" },
      ]}
    >
      <h1 className="page-title">Corporate</h1>
      <p className="page-subtitle">Modules for this department are coming soon.</p>
    </DashboardLayout>
  );
}
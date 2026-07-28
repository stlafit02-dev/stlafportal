import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";

export function MarketingDashboard() {
  return (
    <DashboardLayout
      departmentLabel="Marketing Department"
      navItems={[{ label: "Employees", to: "/dashboard/marketing" }]}
    >
      <h1 className="page-title">Marketing</h1>
      <p className="page-subtitle">Modules for this department are coming soon.</p>
    </DashboardLayout>
  );
}
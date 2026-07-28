import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";

export function LitigationDashboard() {
  return (
    <DashboardLayout
      departmentLabel="Litigation Department"
      navItems={[{ label: "Employees", to: "/dashboard/litigation" }]}
    >
      <h1 className="page-title">Litigation</h1>
      <p className="page-subtitle">Modules for this department are coming soon.</p>
    </DashboardLayout>
  );
}
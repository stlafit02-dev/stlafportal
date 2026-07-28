import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";

export function HrDashboard() {
  return (
    <DashboardLayout
      departmentLabel="HR Admin Department"
      navItems={[{ label: "Employees", to: "/dashboard/hr-admin" }]}
    >
      <h1 className="page-title">Employees</h1>
      <p className="page-subtitle">Module coming soon.</p>
    </DashboardLayout>
  );
}
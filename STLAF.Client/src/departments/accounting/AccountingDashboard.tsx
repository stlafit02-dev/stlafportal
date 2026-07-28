import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";

export function AccountingDashboard() {
  return (
    <DashboardLayout
      departmentLabel="Accounting Department"
      navItems={[{ label: "Employees", to: "/dashboard/accounting" }]}
    >
      <h1 className="page-title">Accounting</h1>
      <p className="page-subtitle">Modules for this department are coming soon.</p>
    </DashboardLayout>
  );
}
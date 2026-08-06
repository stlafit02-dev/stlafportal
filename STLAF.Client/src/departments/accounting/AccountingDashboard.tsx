import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";

export function AccountingDashboard() {
  return (
    <DashboardLayout
      departmentLabel="Accounting Department"
      navItems={buildNavItems("Accounting")}
    >
      <h1 className="page-title">Accounting</h1>
      <p className="page-subtitle">
        Modules for this department are coming soon.
      </p>
    </DashboardLayout>
  );
}
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";

export function LitigationDashboard() {
  return (
    <DashboardLayout
      departmentLabel="Litigation Department"
      navItems={buildNavItems("Litigation")}
    >
      <h1 className="page-title">Litigation</h1>
      <p className="page-subtitle">
        Modules for this department are coming soon.
      </p>
    </DashboardLayout>
  );
}
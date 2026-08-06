import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";

export function MarketingDashboard() {
  return (
    <DashboardLayout
      departmentLabel="Marketing Department"
      navItems={buildNavItems("Marketing")}
    >
      <h1 className="page-title">Marketing</h1>
      <p className="page-subtitle">
        Modules for this department are coming soon.
      </p>
    </DashboardLayout>
  );
}
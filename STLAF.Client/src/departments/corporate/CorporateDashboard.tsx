import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";
import { buildNavItems } from "../../common/navConfig";

export function CorporateDashboard() {
  return (
    <DashboardLayout
      departmentLabel="Corporate Department"
      navItems={buildNavItems("Corporate")}
    >
      <h1 className="page-title">Corporate</h1>
      <p className="page-subtitle">
        Modules for this department are coming soon.
      </p>
    </DashboardLayout>
  );
}
import type { ReactNode } from "react";
import { DashboardLayout } from "./components/DashboardLayout/DashboardLayout";
import { useAuth } from "../auth/useAuth";
import { buildNavItems } from "./navConfig";

export function PortalRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const department = user?.department ?? "IT";

  return (
    <DashboardLayout departmentLabel={`${department} Department`} navItems={buildNavItems(department)}>
      {children}
    </DashboardLayout>
  );
}
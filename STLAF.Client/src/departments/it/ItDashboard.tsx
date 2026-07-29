import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../../common/components/DashboardLayout/DashboardLayout";

export function ItDashboard() {
  return (
    <DashboardLayout
      departmentLabel="IT Department"
      navItems={[
        { label: "Ticketing", to: "/dashboard/ticketing" },
        { label: "Asset Management", to: "/dashboard/assets" },
        {
          label: "Gmail Management",
          children: [
            { label: "GWS Accounts", to: "/dashboard/gmail/accounts" },
            { label: "Email Accounts", to: "/dashboard/gmail/emails" },
            { label: "App Passwords", to: "/dashboard/gmail/app-passwords" },
          ],
        },
      ]}
    >
      <Outlet />
    </DashboardLayout>
  );
}

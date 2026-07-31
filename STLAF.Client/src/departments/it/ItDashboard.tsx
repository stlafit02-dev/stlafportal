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
        {
          label: "Leave & Overtime",
          children: [
            { label: "My Leave", to: "/dashboard/leave/my-leave" },
            { label: "My Overtime", to: "/dashboard/leave/overtime" },
            { label: "Approvals", to: "/dashboard/leave/approvals" },
            {
              label: "Final Approvals",
              to: "/dashboard/leave/final-approvals",
            },
          ],
        },
      ]}
    >
      <Outlet />
    </DashboardLayout>
  );
}

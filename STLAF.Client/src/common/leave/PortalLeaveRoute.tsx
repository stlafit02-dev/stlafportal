import {
  DashboardLayout,
  type NavItem,
} from "../components/DashboardLayout/DashboardLayout";
import { useAuth } from "../../auth/useAuth";
import { LeavePage } from "./LeavePage";

const DEPARTMENT_NAV: Record<string, NavItem[]> = {
  IT: [
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
    { label: "Leave", to: "/dashboard/leave" },
  ],
  HRAdmin: [
    { label: "Employees", to: "/dashboard/hr-admin/employees" },
    { label: "Leave Settings", to: "/dashboard/hr-admin/leave-settings" },
    { label: "Leave", to: "/dashboard/leave" },
  ],
  Litigation: [
    { label: "Overview", to: "/dashboard/litigation" },
    { label: "Leave", to: "/dashboard/leave" },
  ],
  Accounting: [
    { label: "Overview", to: "/dashboard/accounting" },
    { label: "Leave", to: "/dashboard/leave" },
  ],
  Corporate: [
    { label: "Overview", to: "/dashboard/corporate" },
    { label: "Leave", to: "/dashboard/leave" },
  ],
  Marketing: [
    { label: "Overview", to: "/dashboard/marketing" },
    { label: "Leave", to: "/dashboard/leave" },
  ],
};

export function PortalLeaveRoute() {
  const { user } = useAuth();
  const department = user?.department ?? "IT";
  const navItems = DEPARTMENT_NAV[department] ?? [
    { label: "Leave", to: "/dashboard/leave" },
  ];

  return (
    <DashboardLayout
      departmentLabel={`${department} Department`}
      navItems={navItems}
    >
      <LeavePage />
    </DashboardLayout>
  );
}

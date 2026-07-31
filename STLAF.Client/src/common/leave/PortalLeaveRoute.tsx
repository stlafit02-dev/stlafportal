import { Outlet } from "react-router-dom";
import { DashboardLayout, type NavItem } from "../components/DashboardLayout/DashboardLayout";
import { useAuth } from "../../auth/useAuth";

const LEAVE_CHILDREN = [
  { label: "My Leave", to: "/dashboard/leave/my-leave" },
  { label: "My Overtime", to: "/dashboard/leave/overtime" },
  { label: "Approvals", to: "/dashboard/leave/approvals" },
  { label: "Final Approvals", to: "/dashboard/leave/final-approvals" },
];

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
    { label: "Leave & Overtime", children: LEAVE_CHILDREN },
  ],
  HRAdmin: [
    { label: "Employees", to: "/dashboard/hr-admin/employees" },
    { label: "Leave Settings", to: "/dashboard/hr-admin/leave-settings" },
    { label: "Leave & Overtime", children: LEAVE_CHILDREN },
  ],
  Litigation: [
    { label: "Overview", to: "/dashboard/litigation" },
    { label: "Leave & Overtime", children: LEAVE_CHILDREN },
  ],
  Accounting: [
    { label: "Overview", to: "/dashboard/accounting" },
    { label: "Leave & Overtime", children: LEAVE_CHILDREN },
  ],
  Corporate: [
    { label: "Overview", to: "/dashboard/corporate" },
    { label: "Leave & Overtime", children: LEAVE_CHILDREN },
  ],
  Marketing: [
    { label: "Overview", to: "/dashboard/marketing" },
    { label: "Leave & Overtime", children: LEAVE_CHILDREN },
  ],
};

export function PortalLeaveRoute() {
  const { user } = useAuth();
  const department = user?.department ?? "IT";
  const navItems = DEPARTMENT_NAV[department] ?? [{ label: "Leave & Overtime", children: LEAVE_CHILDREN }];

  return (
    <DashboardLayout departmentLabel={`${department} Department`} navItems={navItems}>
      <Outlet />
    </DashboardLayout>
  );
}
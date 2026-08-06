import type { NavItem } from "./components/DashboardLayout/DashboardLayout";

const LEAVE_CHILDREN: NavItem["children"] = [
  { label: "My Leave", to: "/dashboard/leave/my-leave" },
  { label: "My Overtime", to: "/dashboard/leave/overtime" },
  { label: "My Undertime", to: "/dashboard/leave/undertime" },
  { label: "Approvals", to: "/dashboard/leave/approvals" },
  { label: "Final Approvals", to: "/dashboard/leave/final-approvals" },
];

const DEPT_SPECIFIC_NAV: Record<string, NavItem[]> = {
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
  ],
  HRAdmin: [
    { label: "Employees", to: "/dashboard/hr-admin/employees" },
    { label: "Leave Settings", to: "/dashboard/hr-admin/leave-settings" },
    { label: "Medical Certificates", to: "/dashboard/hr-admin/medical-certificates" },
    { label: "Reports", to: "/dashboard/hr-admin/reports" },
  ],
  Litigation: [{ label: "Overview", to: "/dashboard/litigation" }],
  Accounting: [{ label: "Overview", to: "/dashboard/accounting" }],
  Corporate: [{ label: "Overview", to: "/dashboard/corporate" }],
  Marketing: [{ label: "Overview", to: "/dashboard/marketing" }],
};

export function buildNavItems(department: string): NavItem[] {
  const specific = DEPT_SPECIFIC_NAV[department] ?? [];
  return [...specific, ...SHARED_NAV];
}
const SHARED_NAV: NavItem[] = [
  { label: "Submit Ticket", action: "submitTicket" },
  { label: "Leave & Overtime", children: LEAVE_CHILDREN },
];

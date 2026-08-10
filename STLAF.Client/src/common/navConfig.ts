import type { NavItem } from "./components/DashboardLayout/DashboardLayout";

export function departmentSlug(department: string): string {
  if (department === "HRAdmin") return "hr-admin";
  return department.toLowerCase();
}

function leaveChildren(
  deptSlug: string,
  showApprovals: boolean,
  showFinalApprovals: boolean,
): NavItem["children"] {
  const items: { label: string; to: string }[] = [
    { label: "My Leave", to: `/${deptSlug}/leave/my-leave` },
    { label: "My Overtime", to: `/${deptSlug}/leave/overtime` },
    { label: "My Undertime", to: `/${deptSlug}/leave/undertime` },
  ];
  if (showApprovals)
    items.push({ label: "Approvals", to: `/${deptSlug}/leave/approvals` });
  if (showFinalApprovals)
    items.push({
      label: "Final Approvals",
      to: `/${deptSlug}/leave/final-approvals`,
    });
  return items;
}

function sharedNav(
  deptSlug: string,
  showApprovals: boolean,
  showFinalApprovals: boolean,
): NavItem[] {
  return [
    { label: "Submit Ticket", action: "submitTicket" },
    {
      label: "Leave & Overtime",
      children: leaveChildren(deptSlug, showApprovals, showFinalApprovals),
    },
  ];
}

interface ModuleChildItem {
  label: string;
  to: string;
  module?: string;
}

interface ModuleNavItem {
  label: string;
  to: string;
  module?: string;
  children?: ModuleChildItem[];
}

function deptModuleNav(department: string): ModuleNavItem[] {
  switch (department) {
    case "IT":
      return [
        { label: "Overview", to: "/it" },
        { label: "Ticketing", to: "/it/ticketing", module: "it-ticketing" },
        { label: "Asset Management", to: "/it/assets", module: "it-assets" },
        {
          label: "Gmail Management",
          to: "/it/gmail/accounts",
          module: "it-gmail",
          children: [
            {
              label: "GWS Accounts",
              to: "/it/gmail/accounts",
              module: "it-gmail",
            },
            {
              label: "Email Accounts",
              to: "/it/gmail/emails",
              module: "it-gmail",
            },
            {
              label: "App Passwords",
              to: "/it/gmail/app-passwords",
              module: "it-gmail",
            },
          ],
        },
      ];
    case "HRAdmin":
      return [
        { label: "Overview", to: "/hr-admin" },
        {
          label: "Employees",
          to: "/hr-admin/employees",
          module: "hr-employees",
        },
        {
          label: "Leave Settings",
          to: "/hr-admin/leave-settings",
          module: "hr-leave-settings",
        },
        {
          label: "Medical Certificates",
          to: "/hr-admin/medical-certificates",
          module: "hr-medical-certificates",
        },
        { label: "Reports", to: "/hr-admin/reports", module: "hr-reports" },
      ];
    default:
      return [{ label: "Overview", to: `/${departmentSlug(department)}` }];
  }
}

const RESTRICTED_DEPARTMENTS = ["IT", "HRAdmin"];

export function buildNavItems(
  department: string,
  role: string | undefined,
  officePosition: string | undefined,
  modulePositions: { module: string; officePosition: string }[],
  showApprovals: boolean,
  showFinalApprovals: boolean,
): NavItem[] {
  const deptSlug = departmentSlug(department);
  const shared = sharedNav(deptSlug, showApprovals, showFinalApprovals);
  const isBypassed = role === "SuperAdmin" || role === "DeptAdmin";

  const isModuleAllowed = (module?: string): boolean => {
    if (!module) return true;
    if (!RESTRICTED_DEPARTMENTS.includes(department)) return true;
    return (
      isBypassed ||
      (!!officePosition &&
        modulePositions.some(
          (p) => p.module === module && p.officePosition === officePosition,
        ))
    );
  };

  const rawItems = deptModuleNav(department);

  const filtered: NavItem[] = rawItems
    .filter((item) => isModuleAllowed(item.module))
    .map((item): NavItem | null => {
      if (item.children) {
        const visibleChildren = item.children.filter((c) =>
          isModuleAllowed(c.module),
        );
        if (visibleChildren.length === 0) return null;
        return {
          label: item.label,
          children: visibleChildren.map((c) => ({ label: c.label, to: c.to })),
        };
      }
      return { label: item.label, to: item.to };
    })
    .filter((item): item is NavItem => item !== null);

  return [...filtered, ...shared];
}

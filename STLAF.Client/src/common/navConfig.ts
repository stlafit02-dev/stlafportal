import type { NavItem } from "./components/DashboardLayout/DashboardLayout";

export function departmentSlug(department: string): string {
  if (department === "HRAdmin") return "hr-admin";
  return department.toLowerCase();
}

function leaveChildren(
  deptSlug: string,
  showApprovals: boolean,
  showFinalApprovals: boolean,
): { label: string; to: string }[] {
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

interface ModuleChildItem {
  label: string;
  to?: string;
  action?: "submitDocument";
  module?: string;
}

interface ModuleNavItem {
  label: string;
  to?: string;
  action?: "submitTicket" | "submitDocument";
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
    case "Partner":
      return [
        {
          label: "Dashboard",
          to: "/partner",
          module: "document-partner-review",
        },
        {
          label: "Repository",
          to: "/partner/repository",
          module: "document-partner-review",
        },
      ];
    default:
      return [{ label: "Overview", to: `/${departmentSlug(department)}` }];
  }
}

export function buildNavItems(
  department: string,
  role: string | undefined,
  officePosition: string | undefined,
  modulePositions: { module: string; officePosition: string }[],
  showApprovals: boolean,
  showFinalApprovals: boolean,
): NavItem[] {
  const deptSlug = departmentSlug(department);
  const isBypassed = role === "SuperAdmin" || role === "DeptAdmin";

  const isModuleAllowed = (module?: string): boolean => {
    if (!module) return true;
    return (
      isBypassed ||
      (!!officePosition &&
        modulePositions.some(
          (p) => p.module === module && p.officePosition === officePosition,
        ))
    );
  };

  const managementApprovalChildren: ModuleChildItem[] = (
    [
      { label: "Submit Document", action: "submitDocument" as const },
      { label: "My Documents", to: "/documents/my-documents" },
      {
        label: "EA Review",
        to: "/documents/ea-review",
        module: "document-ea-review",
      },
    ] satisfies ModuleChildItem[]
  ).filter((c) => isModuleAllowed(c.module));

  const isPartner = department === "Partner";

  const rawItems: ModuleNavItem[] = [
    ...deptModuleNav(department),
    { label: "Submit Ticket", action: "submitTicket" },
    ...(isPartner
      ? []
      : [
          {
            label: "Leave & Overtime",
            children: leaveChildren(
              deptSlug,
              showApprovals,
              showFinalApprovals,
            ),
          },
        ]),
    ...(!isPartner && managementApprovalChildren.length > 0
      ? [{ label: "Management Approval", children: managementApprovalChildren }]
      : []),
  ];

  return rawItems
    .filter((item) => isModuleAllowed(item.module))
    .map((item): NavItem => {
      if (item.children) {
        return {
          label: item.label,
          children: item.children
            .filter((c) => isModuleAllowed(c.module))
            .map((c) =>
              c.action
                ? { label: c.label, action: c.action }
                : { label: c.label, to: c.to! },
            ),
        };
      }
      if (item.action) {
        return { label: item.label, action: item.action };
      }
      return { label: item.label, to: item.to! };
    })
    .filter((item) => !item.children || item.children.length > 0);
}

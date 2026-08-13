const DEPARTMENT_LABELS: Record<string, string> = {
  HRAdmin: "HR Admin",
};

export function getDepartmentLabel(value: string): string {
  return DEPARTMENT_LABELS[value] ?? value;
}
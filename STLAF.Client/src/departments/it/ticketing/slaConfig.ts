export const SLA_MINUTES: Record<string, number> = {
  Urgent: 15,
  High: 30,
  Medium: 120,
  Low: 240,
};

export function formatSlaDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = minutes / 60;
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

export function getSlaDeadline(dateSubmittedIso: string, priority: string): Date {
  const minutes = SLA_MINUTES[priority] ?? SLA_MINUTES.Low;
  return new Date(new Date(dateSubmittedIso).getTime() + minutes * 60000);
}

export function getSlaStatus(dateSubmittedIso: string, priority: string, referenceIso?: string): "on-time" | "overdue" {
  const deadline = getSlaDeadline(dateSubmittedIso, priority);
  const reference = referenceIso ? new Date(referenceIso) : new Date();
  return reference.getTime() > deadline.getTime() ? "overdue" : "on-time";
}
import apiClient from "../../../common/api/apiClient";

export interface ReportFilter {
  from?: string;
  to?: string;
  department?: string;
}

export async function downloadLeaveOvertimeReport(filter: ReportFilter): Promise<void> {
  const params = new URLSearchParams();
  if (filter.from) params.append("from", filter.from);
  if (filter.to) params.append("to", filter.to);
  if (filter.department && filter.department !== "All") params.append("department", filter.department);

  const res = await apiClient.get(`/hr/reports/leave-overtime?${params.toString()}`, {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Leave-Overtime-Report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
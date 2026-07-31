import apiClient from "../../../common/api/apiClient";

export interface EmployeeCategory {
  id: string;
  name: string;
  code: number;
}

export interface CreateEmployeeCategoryPayload {
  name: string;
  code: number;
}

export interface Employee {
  id: string;
  companyId: string;
  username: string;
  categoryName: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  mobileNumber?: string | null;
  age: number;
  sex: string;
  bday: string;
  nationality: string;
  department: string;
  officePosition: string;
  personalEmail?: string | null;
  companyEmail?: string | null;
  startDate: string;
  status: string;
  createdAt: string;
}

export interface CreateEmployeePayload {
  categoryId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  age: number;
  sex: string;
  bday: string;
  nationality: string;
  department: string;
  officePosition: string;
  personalEmail?: string;
  companyEmail?: string;
  mobileNumber?: string;
  startDate: string;
  status: string;
  manualCompanyId?: string;
}

export interface CreateEmployeeResult {
  employee: Employee;
  generatedPassword: string;
}

export interface UpdateEmployeePayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  mobileNumber?: string;
  age: number;
  sex: string;
  bday: string;
  nationality: string;
  department: string;
  officePosition: string;
  personalEmail?: string;
  companyEmail?: string;
  startDate: string;
  status: string;
}

export async function fetchCategories(): Promise<EmployeeCategory[]> {
  const res = await apiClient.get<EmployeeCategory[]>("/hr/categories");
  return res.data;
}

export async function createCategory(
  payload: CreateEmployeeCategoryPayload,
): Promise<EmployeeCategory> {
  const res = await apiClient.post<EmployeeCategory>("/hr/categories", payload);
  return res.data;
}

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await apiClient.get<Employee[]>("/hr/employees");
  return res.data;
}

export async function createEmployee(
  payload: CreateEmployeePayload,
): Promise<CreateEmployeeResult> {
  const res = await apiClient.post<CreateEmployeeResult>(
    "/hr/employees",
    payload,
  );
  return res.data;
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload,
): Promise<Employee> {
  const res = await apiClient.put<Employee>(`/hr/employees/${id}`, payload);
  return res.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await apiClient.delete(`/hr/employees/${id}`);
}

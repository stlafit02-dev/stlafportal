import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

interface DepartmentGuardProps {
  department: string;
  children: ReactNode;
}

export function DepartmentGuard({ department, children }: DepartmentGuardProps) {
  const { user } = useAuth();

  const allowed = user?.role === "SuperAdmin" || user?.department === department;

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
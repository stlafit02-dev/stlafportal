import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useClientPortalAdminAccess } from "../client-portal-admin/useClientPortalAdminAccess";
import { PageLoader } from "./Loader/Loader";

export function ClientPortalAdminGuard({ children }: { children: ReactNode }) {
  const { hasAccess, isLoaded } = useClientPortalAdminAccess();

  if (!isLoaded) return <PageLoader label="Checking access…" />;
  if (!hasAccess) return <Navigate to="/" replace />;

  return <>{children}</>;
}

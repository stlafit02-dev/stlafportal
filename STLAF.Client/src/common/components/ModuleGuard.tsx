import type { ReactNode } from "react";
import { useAuth } from "../../auth/useAuth";
import { useModuleAccessPositions } from "../access/useModuleAccess";

interface ModuleGuardProps {
  module: string;
  children: ReactNode;
}

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { user } = useAuth();
  const { positions, isLoaded } = useModuleAccessPositions();

  if (!isLoaded) return null;

  const isBypassed = user?.role === "SuperAdmin" || user?.role === "DeptAdmin";
  const isAllowed =
    isBypassed ||
    (!!user?.officePosition &&
      positions.some((p) => p.module === module && p.officePosition === user.officePosition));

  if (!isAllowed) {
    return (
      <div className="gmail-page">
        <div className="gmail-empty" style={{ marginTop: 40 }}>
          You don't have access to this section. Contact your department admin if you believe this is a mistake.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
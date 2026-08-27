import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { checkMyAdminAccess } from "./clientPortalAdminApi";

let cached: boolean | null = null;

export function useClientPortalAdminAccess() {
  const { user } = useAuth();
  const bypass = user?.role === "SuperAdmin" || user?.role === "DeptAdmin";

  const [hasAccess, setHasAccess] = useState<boolean | null>(bypass ? true : cached);
  const isLoaded = bypass || cached !== null;

  useEffect(() => {
    if (bypass || cached !== null) return;
    checkMyAdminAccess().then((result) => {
      cached = result;
      setHasAccess(result);
    });
  }, [bypass]);

  return { hasAccess: hasAccess ?? false, isLoaded };
}

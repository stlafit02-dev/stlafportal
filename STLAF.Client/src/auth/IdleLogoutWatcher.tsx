import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { IdleLogoutModal } from "./IdleLogoutModal";

const INACTIVITY_LIMIT_MS = 900000; //15 mins for 900000
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

const PUBLIC_PATH_PREFIXES = ["/it-helpdesk", "/assets/", "/"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATH_PREFIXES.some((prefix) => prefix !== "/" && pathname.startsWith(prefix));
}

export function IdleLogoutWatcher() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Never run the inactivity timer on public, unauthenticated pages —
    // regardless of whether a stale token happens to still be in localStorage.
    if (!isAuthenticated || isPublicPath(location.pathname)) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        await logout();
        setShowModal(true);
      }, INACTIVITY_LIMIT_MS);
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, logout, location.pathname]);

  function handleDismiss() {
    setShowModal(false);
    navigate("/", { replace: true });
  }

  return <IdleLogoutModal isOpen={showModal} onClose={handleDismiss} />;
}
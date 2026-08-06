import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { IdleLogoutModal } from "./IdleLogoutModal";

const INACTIVITY_LIMIT_MS = 900000; //15 mins for 900000
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export function IdleLogoutWatcher() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only manage the inactivity timer while logged in.
    // Deliberately does NOT clear showModal here — that would erase the modal
    // the instant logout() flips isAuthenticated to false.
    if (!isAuthenticated) {
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
  }, [isAuthenticated, logout]);

  function handleDismiss() {
    setShowModal(false);
    navigate("/", { replace: true });
  }

  return <IdleLogoutModal isOpen={showModal} onClose={handleDismiss} />;
}
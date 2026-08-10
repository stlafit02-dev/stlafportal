import { useEffect, useState } from "react";
import { fetchAmIApprover } from "./leaveApi";
import { fetchAmIDeptApprover, fetchAmIPartner } from "./overtimeApi";
import { fetchAmIUndertimeApprover } from "./undertimeApi";

export function useApprovalStatus() {
  const [showApprovals, setShowApprovals] = useState(false);
  const [showFinalApprovals, setShowFinalApprovals] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchAmIApprover(),
      fetchAmIDeptApprover(),
      fetchAmIUndertimeApprover(),
      fetchAmIPartner(),
    ]).then(([isLeaveApprover, isOvertimeDeptApprover, isUndertimeApprover, isPartner]) => {
      setShowApprovals(isLeaveApprover || isOvertimeDeptApprover || isUndertimeApprover);
      setShowFinalApprovals(isPartner);
      setIsLoaded(true);
    });
  }, []);

  return { showApprovals, showFinalApprovals, isLoaded };
}
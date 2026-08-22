import { useEffect, useState } from "react";
import { fetchAmIApprover } from "./leaveApi";
import { fetchAmIDeptApprover, fetchAmIPartner } from "./overtimeApi";
import { fetchAmIUndertimeApprover } from "./undertimeApi";
import { fetchAmIPointPerson } from "../intake/intakeApi";

export function useApprovalStatus() {
  const [showApprovals, setShowApprovals] = useState(false);
  const [showFinalApprovals, setShowFinalApprovals] = useState(false);
  const [showMyInquiries, setShowMyInquiries] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchAmIApprover(),
      fetchAmIDeptApprover(),
      fetchAmIUndertimeApprover(),
      fetchAmIPartner(),
      fetchAmIPointPerson(),
    ]).then(([isLeaveApprover, isOvertimeDeptApprover, isUndertimeApprover, isPartner, isPointPerson]) => {
      setShowApprovals(isLeaveApprover || isOvertimeDeptApprover || isUndertimeApprover);
      setShowFinalApprovals(isPartner);
      setShowMyInquiries(isPointPerson);
      setIsLoaded(true);
    });
  }, []);

  return { showApprovals, showFinalApprovals, showMyInquiries, isLoaded };
}
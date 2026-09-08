import { useAuth } from "../../auth/useAuth";
import { DashboardWireframe } from "../../common/components/DashboardWireframe/DashboardWireframe";
import { LastTicketCard } from "../../common/tickets/LastTicketCard";

export function HrOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="gmail-page overview-page-fill">
      <div className="gmail-page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.fullName?.split(" ")[0] ?? "there"}</h1>
          <p className="page-subtitle">HR Admin Department</p>
        </div>
      </div>
      <DashboardWireframe side={<LastTicketCard />} />
    </div>
  );
}

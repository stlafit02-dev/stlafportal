import { useAuth } from "../../auth/useAuth";

export function HrOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.fullName?.split(" ")[0] ?? "there"}</h1>
          <p className="page-subtitle">HR Admin Department</p>
        </div>
      </div>
      <div className="ls-empty">
        Use the sidebar to submit a ticket or manage your leave and overtime.
      </div>
    </div>
  );
}
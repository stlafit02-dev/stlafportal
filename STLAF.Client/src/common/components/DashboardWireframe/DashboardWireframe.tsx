import type { ReactNode } from "react";
import "./DashboardWireframe.css";

function WireframeStatBlock() {
  return (
    <div className="wireframe-stat-block">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3" strokeDasharray="3 3" />
      </svg>
    </div>
  );
}

interface DashboardWireframeProps {
  /** Real widget rendered in the bottom-right slot, e.g. <LastTicketCard />. */
  side: ReactNode;
}

export function DashboardWireframe({ side }: DashboardWireframeProps) {
  return (
    <div className="dashboard-wireframe">
      <div className="wireframe-stat-row">
        {Array.from({ length: 4 }, (_, i) => (
          <WireframeStatBlock key={i} />
        ))}
      </div>
      <div className="wireframe-body">
        <div className="wireframe-panel">
          <span className="wireframe-panel-label">More insights coming soon</span>
        </div>
        <div className="wireframe-side">{side}</div>
      </div>
    </div>
  );
}

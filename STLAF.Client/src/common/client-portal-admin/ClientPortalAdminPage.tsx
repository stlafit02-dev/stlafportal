import { useState } from "react";
import { ServicesTab } from "./ServicesTab";
import { VouchersTab } from "./VouchersTab";
import { DocumentsTab } from "./DocumentsTab";
import "./ClientPortalAdminPage.css";

type Tab = "services" | "vouchers" | "documents";

export function ClientPortalAdminPage() {
  const [tab, setTab] = useState<Tab>("services");

  return (
    <div>
      <h1 className="page-title">Client Portal Admin</h1>
      <p className="page-subtitle">Manage the services, forms, templates, and vouchers for the stlaf-draft client portal.</p>

      <nav className="cpa-tabs">
        <button className={`cpa-tab ${tab === "services" ? "cpa-tab-active" : ""}`} onClick={() => setTab("services")}>
          Services
        </button>
        <button className={`cpa-tab ${tab === "vouchers" ? "cpa-tab-active" : ""}`} onClick={() => setTab("vouchers")}>
          Vouchers
        </button>
        <button className={`cpa-tab ${tab === "documents" ? "cpa-tab-active" : ""}`} onClick={() => setTab("documents")}>
          Documents
        </button>
      </nav>

      <div className="cpa-tab-content">
        {tab === "services" && <ServicesTab />}
        {tab === "vouchers" && <VouchersTab />}
        {tab === "documents" && <DocumentsTab />}
      </div>
    </div>
  );
}

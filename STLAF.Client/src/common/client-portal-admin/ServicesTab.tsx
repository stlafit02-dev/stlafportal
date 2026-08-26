import { useEffect, useState } from "react";
import { fetchAllServices, saveService } from "./clientPortalAdminApi";
import type { Service, FieldDefinition } from "./types";
import { FormSchemaEditor } from "./FormSchemaEditor";
import { TemplateUpload } from "./TemplateUpload";
import { Spinner } from "../components/Loader/Loader";
import "../../departments/it/gmail/GmailManagementPage.css";
import "../../departments/it/gmail/GmailForms.css";

const NEW_SERVICE: Service = {
  id: "",
  name: "",
  description: "",
  category: "",
  isActive: true,
  createdAt: "",
};

export function ServicesTab() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [selected, setSelected] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "", isActive: true });
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    fetchAllServices().then(setServices);
  }

  useEffect(reload, []);

  function selectService(service: Service) {
    setSelected(service);
    setForm({
      name: service.name,
      description: service.description ?? "",
      category: service.category ?? "",
      isActive: service.isActive,
    });
    setFields([]);
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const saved = await saveService(selected?.id || null, form);
      setSelected(saved);
      reload();
    } catch {
      setError("Could not save this service.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!services) {
    return (
      <div className="gmail-page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="gmail-page">
      <div className="gmail-page-header">
        <div>
          <h2 className="gmail-section-title" style={{ marginBottom: 4 }}>Services</h2>
          <p className="page-subtitle">Manage the services clients can request.</p>
        </div>
        <button className="gmail-primary-btn" onClick={() => selectService(NEW_SERVICE)}>
          + New service
        </button>
      </div>

      <div className="gmail-table-wrap" style={{ height: "auto", marginBottom: 24 }}>
        <table className="gmail-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.name}</td>
                <td>{service.category || <span className="unassigned-text">—</span>}</td>
                <td>
                  <span className={`status-badge ${service.isActive ? "badge-active" : "badge-inactive"}`}>
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button className="gmail-secondary-btn" onClick={() => selectService(service)}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <section className="gmail-section">
          <h2 className="gmail-section-title">{selected.id ? `Editing: ${selected.name}` : "New service"}</h2>

          <form className="gmail-form" onSubmit={handleSave} style={{ maxWidth: 480 }}>
            <div className="gmail-field">
              <label className="gmail-label">Name</label>
              <input
                className="gmail-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Category</label>
              <input
                className="gmail-input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div className="gmail-field">
              <label className="gmail-label">Description</label>
              <textarea
                className="gmail-input gmail-textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <label className="gmail-checkbox-label">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active (visible to clients)
            </label>

            {error && <p className="gmail-error">{error}</p>}

            <div className="gmail-actions" style={{ borderTop: "none", paddingTop: 0, justifyContent: "flex-start" }}>
              <button type="submit" className="gmail-submit-btn" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save service"}
              </button>
            </div>
          </form>

          {selected.id && (
            <>
              <FormSchemaEditor serviceId={selected.id} onSaved={setFields} />
              <TemplateUpload serviceId={selected.id} fields={fields} />
            </>
          )}
        </section>
      )}
    </div>
  );
}

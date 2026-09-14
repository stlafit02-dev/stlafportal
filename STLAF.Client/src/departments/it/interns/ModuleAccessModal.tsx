import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../common/components/Modal/Modal";
import { Spinner } from "../../../common/components/Loader/Loader";
import {
  fetchModuleCatalog,
  fetchInternModules,
  setInternModules,
  type ModuleCatalogEntry,
  type InternAccount,
} from "./internAccountApi";
import { refreshModuleAccessPositions } from "../../../common/access/useModuleAccess";
import "../../it/gmail/GmailForms.css";
import "./InternAccountsPage.css";

function splitLabel(label: string): { group: string; name: string } {
  const idx = label.indexOf(":");
  if (idx === -1) return { group: "General", name: label };
  return { group: label.slice(0, idx).trim(), name: label.slice(idx + 1).trim() };
}

interface ModuleAccessModalProps {
  intern: InternAccount | null;
  onClose: () => void;
  onSaved: (internId: string, modules: string[]) => void;
}

export function ModuleAccessModal({
  intern,
  onClose,
  onSaved,
}: ModuleAccessModalProps) {
  const [catalog, setCatalog] = useState<ModuleCatalogEntry[]>([]);
  const [savedModules, setSavedModules] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!intern) return;
    setIsLoading(true);
    Promise.all([fetchModuleCatalog(), fetchInternModules(intern.id)]).then(
      ([moduleCatalog, currentModules]) => {
        setCatalog(moduleCatalog);
        setSavedModules(currentModules);
        setSelectedModules(currentModules);
        setIsLoading(false);
      },
    );
  }, [intern]);

  function toggleModule(key: string) {
    setSelectedModules((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key],
    );
  }

  const hasUnsavedChanges = useMemo(() => {
    if (selectedModules.length !== savedModules.length) return true;
    const savedSet = new Set(savedModules);
    return selectedModules.some((m) => !savedSet.has(m));
  }, [selectedModules, savedModules]);

  const groupedModules = useMemo(() => {
    const groups = new Map<string, { key: string; name: string }[]>();
    catalog.forEach((m) => {
      const { group, name } = splitLabel(m.label);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push({ key: m.key, name });
    });
    return Array.from(groups.entries());
  }, [catalog]);

  async function handleSave() {
    if (!intern) return;
    setIsSaving(true);
    try {
      await setInternModules(intern.id, selectedModules);
      await refreshModuleAccessPositions();
      setSavedModules(selectedModules);
      onSaved(intern.id, selectedModules);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={!!intern} onClose={onClose}>
      <div className="gmail-modal module-access-modal">
        <div className="module-access-header">
          <span className="module-access-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <div>
            <h2 className="module-access-title">Module Access</h2>
            <p className="module-access-subtitle">
              Choose which modules this intern can access. These settings
              apply only to{" "}
              <strong>{intern?.email ?? "this intern"}</strong>.
            </p>
          </div>
        </div>

        {intern && (
          <div className="editing-badge">
            <span className="editing-badge-label">Editing</span>
            <span className="editing-badge-value">{intern.companyId}</span>
          </div>
        )}

        {isLoading ? (
          <div className="gmail-page-loading" style={{ minHeight: 160 }}>
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="module-access-body">
              {groupedModules.map(([group, modules]) => (
                <div className="module-group" key={group}>
                  <p className="module-group-label">{group}</p>
                  <div className="module-tile-grid">
                    {modules.map((m) => {
                      const checked = selectedModules.includes(m.key);
                      return (
                        <label
                          key={m.key}
                          className={`module-tile ${checked ? "module-tile-checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleModule(m.key)}
                          />
                          <span className="module-tile-name">{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="module-access-footer">
              <span className="module-access-status">
                {hasUnsavedChanges && (
                  <span className="module-access-status-dot" />
                )}
                {hasUnsavedChanges
                  ? "You have unsaved changes."
                  : `${savedModules.length} module${savedModules.length === 1 ? "" : "s"} granted to this intern.`}
              </span>
              <div className="gmail-actions" style={{ borderTop: "none", paddingTop: 0 }}>
                <button type="button" className="gmail-cancel-btn" onClick={onClose}>
                  Close
                </button>
                <button
                  type="button"
                  className="gmail-submit-btn"
                  disabled={isSaving || !hasUnsavedChanges}
                  onClick={handleSave}
                >
                  {isSaving ? (
                    <span className="btn-loading">
                      <Spinner size="sm" /> Saving…
                    </span>
                  ) : (
                    "Save Module Access"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

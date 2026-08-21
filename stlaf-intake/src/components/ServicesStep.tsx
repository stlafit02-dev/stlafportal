import { useState } from "react";
import type { IntakeGroupOption, IntakeFormData } from "../types/intake";

interface ServicesStepProps {
  groups: IntakeGroupOption[];
  data: IntakeFormData;
  onChange: <K extends keyof IntakeFormData>(
    field: K,
    value: IntakeFormData[K],
  ) => void;
  onNext: () => void;
  onBack: () => void;
}

interface SelectedEntry {
  id: string;
  label: string;
  category: string;
}

export function ServicesStep({
  groups,
  data,
  onChange,
  onNext,
  onBack,
}: ServicesStepProps) {
  const categories = Array.from(new Set(groups.map((g) => g.category)));
  const [selectedCategory, setSelectedCategory] = useState(categories[0] ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const query = searchQuery.trim().toLowerCase();

  const categoryGroups = groups
    .filter((g) => g.category === selectedCategory)
    .map((g) => ({
      ...g,
      services:
        query === ""
          ? g.services
          : g.services.filter((s) => s.name.toLowerCase().includes(query)),
    }))
    .filter(
      (g) =>
        query === "" ||
        g.services.length > 0 ||
        g.name.toLowerCase().includes(query),
    );

  function handleSelectCategory(category: string) {
    setSelectedCategory(category);
    setSearchQuery("");
    setOpenGroups(new Set());
  }

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleService(id: string) {
    const isSelected = data.selectedServiceIds.includes(id);
    onChange(
      "selectedServiceIds",
      isSelected
        ? data.selectedServiceIds.filter((s) => s !== id)
        : [...data.selectedServiceIds, id],
    );
  }

  function removeSelected(id: string) {
    onChange(
      "selectedServiceIds",
      data.selectedServiceIds.filter((s) => s !== id),
    );
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (data.selectedServiceIds.length === 0) {
      alert("Please select at least one service.");
      return;
    }
    onNext();
  }

  const allSelectable: SelectedEntry[] = groups.flatMap((g) =>
    g.services.length > 0
      ? g.services.map((s) => ({
          id: s.id,
          label: s.name,
          category: g.category,
        }))
      : [{ id: g.id, label: g.name, category: g.category }],
  );

  const selectedEntries = data.selectedServiceIds
    .map((id) => allSelectable.find((entry) => entry.id === id))
    .filter((entry): entry is SelectedEntry => !!entry);

  const selectedCountsByCategory = categories.reduce<Record<string, number>>(
    (acc, category) => {
      acc[category] = selectedEntries.filter(
        (entry) => entry.category === category,
      ).length;
      return acc;
    },
    {},
  );

  function groupSelectedCount(group: IntakeGroupOption): number {
    if (group.services.length === 0) {
      return data.selectedServiceIds.includes(group.id) ? 1 : 0;
    }
    return group.services.filter((s) => data.selectedServiceIds.includes(s.id))
      .length;
  }

  return (
    <form onSubmit={handleNext} className="intake-form">
      <div className="pf-section-title">
        <h2>Services Requested</h2>
      </div>
      <p className="pf-section-subtitle">
        Choose a practice area, then select the services you require
      </p>

      <div className="pf-row">
        <label className="pf-label">Practice Area</label>
        <div className="pf-input-wrap">
          <div className="pf-category-tabs">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`pf-category-tab ${category === selectedCategory ? "pf-category-tab-active" : ""}`}
                onClick={() => handleSelectCategory(category)}
              >
                {category}
                {selectedCountsByCategory[category] > 0 && (
                  <span className="pf-category-tab-count">
                    {" "}
                    · {selectedCountsByCategory[category]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">Search</label>
        <div className="pf-input-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="intake-input"
            placeholder={`Search within ${selectedCategory}…`}
          />
        </div>
      </div>

      <div className="pf-row">
        <span />
        <div className="pf-checkbox-list-wrap">
          {categoryGroups.length === 0 ? (
            <div className="pf-empty-state">No services match your search.</div>
          ) : (
            categoryGroups.map((group) => {
              const isOpen = openGroups.has(group.id) || query !== "";
              const count = groupSelectedCount(group);
              return (
                <div key={group.id} className="pf-group-card">
                  <button
                    type="button"
                    className="pf-group-header"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <span className="pf-group-name">
                      {group.name}
                      {count > 0 && (
                        <span className="pf-group-count">{count}</span>
                      )}
                    </span>
                    <svg
                      className={`pf-group-chevron ${isOpen ? "pf-group-chevron-open" : ""}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="pf-group-body">
                      {group.services.length === 0 ? (
                        <div className="pf-service-grid">
                          <label className="pf-service-checkbox">
                            <input
                              type="checkbox"
                              checked={data.selectedServiceIds.includes(
                                group.id,
                              )}
                              onChange={() => toggleService(group.id)}
                            />
                            <span className="pf-service-checkbox-text">
                              {group.name}
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div className="pf-service-grid">
                          {group.services.map((service) => (
                            <label
                              key={service.id}
                              className="pf-service-checkbox"
                            >
                              <input
                                type="checkbox"
                                checked={data.selectedServiceIds.includes(
                                  service.id,
                                )}
                                onChange={() => toggleService(service.id)}
                              />
                              <span className="pf-service-checkbox-text">
                                {service.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">Selected Services</label>
        <div className="pf-input-wrap">
          <div className="pf-selected-panel">
            <p className="pf-selected-panel-title">
              Your Selections
              {selectedEntries.length > 0 && (
                <span className="pf-selected-panel-count">
                  {selectedEntries.length} selected
                </span>
              )}
            </p>
            {selectedEntries.length === 0 ? (
              <p className="pf-selected-summary-empty">
                No services selected yet.
              </p>
            ) : (
              <div className="pf-selected-chips">
                {selectedEntries.map((entry) => (
                  <div key={entry.id} className="pf-selected-chip">
                    <span>
                      <span className="pf-selected-chip-category">
                        {entry.category.split(",")[0]}
                      </span>
                      {entry.label}
                    </span>
                    <button
                      type="button"
                      className="pf-selected-chip-remove"
                      onClick={() => removeSelected(entry.id)}
                      aria-label={`Remove ${entry.label}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="intake-footnote" style={{ textAlign: "right" }}>
        <p style={{ justifyContent: "flex-end" }}>
          ✓ Always schedules consultation &amp; emails client confirmation.
        </p>
        <p style={{ justifyContent: "flex-end" }}>
          ✓ Drafts personalized AI proposal &amp; emails firm inbox instantly.
        </p>
      </div>

      <div className="intake-actions">
        <button type="button" className="intake-back-btn" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="intake-next-btn">
          Next
        </button>
      </div>
    </form>
  );
}

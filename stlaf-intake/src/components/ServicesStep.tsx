import { useState } from "react";
import type { IntakeGroupOption, IntakeFormData } from "../types/intake";

interface ServicesStepProps {
  groups: IntakeGroupOption[];
  data: IntakeFormData;
  onChange: <K extends keyof IntakeFormData>(field: K, value: IntakeFormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ServicesStep({ groups, data, onChange, onNext, onBack }: ServicesStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(groups[0] ? [groups[0].id] : []));

  const query = searchQuery.trim().toLowerCase();

  const filteredGroups = groups
    .map((g) => ({
      ...g,
      services: query === "" ? g.services : g.services.filter((s) => s.name.toLowerCase().includes(query)),
    }))
    .filter((g) => query === "" || g.services.length > 0 || g.name.toLowerCase().includes(query));

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
      isSelected ? data.selectedServiceIds.filter((s) => s !== id) : [...data.selectedServiceIds, id],
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

  // Group categories together for display
  const categories = Array.from(new Set(filteredGroups.map((g) => g.category)));

  return (
    <form onSubmit={handleNext} className="intake-form">
      <div className="services-header">
        <span className="services-icon">💼</span>
        <div>
          <p className="services-title">SERVICES REQUESTED</p>
          <p className="services-subtitle">Select any legal and compliance services you require</p>
        </div>
      </div>

      <div className="intake-field">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="intake-input"
          placeholder="Search 50+ services (e.g., BIR, SEC, AOI...)"
        />
      </div>

      {categories.map((category) => (
        <div key={category} className="services-category">
          {filteredGroups
            .filter((g) => g.category === category)
            .map((group) => (
              <div key={group.id} className="services-group">
                <button
                  type="button"
                  className="services-group-header"
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>{group.name}</span>
                  <span className={`chevron ${openGroups.has(group.id) || query !== "" ? "chevron-open" : ""}`}>▾</span>
                </button>
                {(openGroups.has(group.id) || query !== "") && (
                  <div className="services-list">
                    {group.services.length === 0 ? (
                      <label className="service-checkbox">
                        <input
                          type="checkbox"
                          checked={data.selectedServiceIds.includes(group.id)}
                          onChange={() => toggleService(group.id)}
                        />
                        {group.name}
                      </label>
                    ) : (
                      group.services.map((service) => (
                        <label key={service.id} className="service-checkbox">
                          <input
                            type="checkbox"
                            checked={data.selectedServiceIds.includes(service.id)}
                            onChange={() => toggleService(service.id)}
                          />
                          {service.name}
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      ))}

      <div className="intake-footnote">
        <p>✓ Always schedules consultation &amp; emails client confirmation.</p>
        <p>✓ Drafts personalized AI proposal &amp; emails firm inbox instantly.</p>
      </div>

      <div className="intake-actions">
        <button type="button" className="intake-back-btn" onClick={onBack}>Back</button>
        <button type="submit" className="intake-next-btn">Next</button>
      </div>
    </form>
  );
}
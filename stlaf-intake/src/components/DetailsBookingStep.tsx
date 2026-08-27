import type { IntakeFormData, IntakeFormOptions } from "../types/intake";

interface DetailsBookingStepProps {
  options: IntakeFormOptions;
  data: IntakeFormData;
  onChange: <K extends keyof IntakeFormData>(
    field: K,
    value: IntakeFormData[K],
  ) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function DetailsBookingStep({
  options,
  data,
  onChange,
  onBack,
  onSubmit,
  isSubmitting,
}: DetailsBookingStepProps) {
  function toggleSlot(slot: string) {
    const isSelected = data.preferredTimeSlots.includes(slot);
    onChange(
      "preferredTimeSlots",
      isSelected
        ? data.preferredTimeSlots.filter((s) => s !== slot)
        : [...data.preferredTimeSlots, slot],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="intake-form">
      <div className="pf-row">
        <label className="pf-label">
          Consultation Preferences <span className="required">*</span>
        </label>
        <div className="pf-input-wrap">
          <select
            value={data.consultationPreference}
            onChange={(e) => onChange("consultationPreference", e.target.value)}
            required
            className="intake-input"
          >
            <option value="" disabled>
              Select an option …
            </option>
            {options.consultationPreferences.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">
          Consultation Date <span className="required">*</span>
        </label>
        <div className="pf-input-wrap">
          <input
            type="date"
            value={data.consultationDate}
            onChange={(e) => onChange("consultationDate", e.target.value)}
            required
            className="intake-input"
          />
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">Preferred Time (GMT+8)</label>
        <div className="pf-input-wrap">
          <div className="time-slot-grid">
            {options.timeSlots.map((slot) => {
              const isSelected = data.preferredTimeSlots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  className={`pf-time-chip ${isSelected ? "pf-time-chip-selected" : ""}`}
                  onClick={() => toggleSlot(slot)}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">Client Concerns</label>
        <div className="pf-input-wrap">
          <textarea
            value={data.clientConcerns}
            onChange={(e) => onChange("clientConcerns", e.target.value)}
            rows={4}
            className="intake-input intake-textarea"
            placeholder="Please outline any concerns or legal services needed"
          />
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">
          Supporting Documents (PDF, Image, or DOCX)
        </label>
        <div className="pf-input-wrap">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            onChange={(e) => onChange("file", e.target.files?.[0] ?? null)}
            className="intake-input"
          />
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">
          How Did You Find Us? <span className="required">*</span>
        </label>
        <div className="pf-input-wrap">
          <select
            value={data.howDidYouFindUs}
            onChange={(e) => onChange("howDidYouFindUs", e.target.value)}
            required
            className="intake-input"
          >
            <option value="" disabled>
              Select an option …
            </option>
            {options.howDidYouFindUsOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
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
        <button
          type="submit"
          className="intake-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </form>
  );
}

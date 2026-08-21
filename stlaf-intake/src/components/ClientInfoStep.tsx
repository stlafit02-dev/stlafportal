import type { IntakeFormData } from "../types/intake";
import { COUNTRIES } from "../data/countries";

const CLIENT_TYPES = [
  "Individual",
  "Corporate",
  "Partnership",
  "Sole Proprietorship",
];
const NUMBER_OF_EMPLOYEES_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
];

interface ClientInfoStepProps {
  data: IntakeFormData;
  onChange: <K extends keyof IntakeFormData>(
    field: K,
    value: IntakeFormData[K],
  ) => void;
  onNext: () => void;
}

export function ClientInfoStep({
  data,
  onChange,
  onNext,
}: ClientInfoStepProps) {
  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleNext} className="intake-form">
      <div className="pf-row">
        <label className="pf-label">
          Client Type <span className="required">*</span>
        </label>
        <div className="pf-input-wrap">
          <select
            value={data.clientType}
            onChange={(e) => onChange("clientType", e.target.value)}
            required
            className="intake-input"
          >
            <option value="" disabled>
              Select an option …
            </option>
            {CLIENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">
          Client Name <span className="required">*</span>
        </label>
        <div className="pf-input-wrap">
          <input
            type="text"
            value={data.clientName}
            onChange={(e) => onChange("clientName", e.target.value)}
            required
            className="intake-input"
            placeholder="Enter client name"
          />
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">Industry (if applicable)</label>
        <div className="pf-input-wrap">
          <input
            type="text"
            value={data.industry}
            onChange={(e) => onChange("industry", e.target.value)}
            className="intake-input"
            placeholder="e.g. Retail, Manufacturing"
          />
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">
          Principal / Residential Address <span className="required">*</span>
        </label>
        <div className="pf-input-wrap">
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange("address", e.target.value)}
            required
            className="intake-input"
            placeholder="Enter complete address"
          />
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">Country</label>
        <div className="pf-input-wrap">
          <select
            value={data.country}
            onChange={(e) => onChange("country", e.target.value)}
            className="intake-input"
          >
            <option value="" disabled>
              Select an option …
            </option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">Number of Employees (if applicable)</label>
        <div className="pf-input-wrap">
          <select
            value={data.numberOfEmployees}
            onChange={(e) => onChange("numberOfEmployees", e.target.value)}
            className="intake-input"
          >
            <option value="" disabled>
              Select an option …
            </option>
            {NUMBER_OF_EMPLOYEES_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">
          Contact Person <span className="required">*</span>
        </label>
        <div className="pf-input-wrap">
          <input
            type="text"
            value={data.contactPerson}
            onChange={(e) => onChange("contactPerson", e.target.value)}
            required
            className="intake-input"
            placeholder="Name of contact person"
          />
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">
          Designation <span className="required">*</span>
        </label>
        <div className="pf-input-wrap">
          <input
            type="text"
            value={data.designation}
            onChange={(e) => onChange("designation", e.target.value)}
            required
            className="intake-input"
          />
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">
          Contact Email <span className="required">*</span>
        </label>
        <div className="pf-input-wrap">
          <input
            type="email"
            value={data.contactEmail}
            onChange={(e) => onChange("contactEmail", e.target.value)}
            required
            className="intake-input"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="pf-row">
        <label className="pf-label">
          Contact Phone <span className="required">*</span>
        </label>
        <div className="pf-input-wrap">
          <input
            type="tel"
            value={data.contactPhone}
            onChange={(e) => onChange("contactPhone", e.target.value)}
            required
            className="intake-input"
            placeholder="09XXXXXXXXX"
          />
        </div>
      </div>

      <div className="intake-actions">
        <button type="submit" className="intake-next-btn">
          Next
        </button>
      </div>
    </form>
  );
}

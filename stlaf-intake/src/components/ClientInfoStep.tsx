import type { IntakeFormData } from "../types/intake";

const CLIENT_TYPES = ["Individual", "Corporate", "Partnership", "Sole Proprietorship"];
const NUMBER_OF_EMPLOYEES_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"];
const COUNTRIES = ["Philippines", "United States", "Singapore", "Other"];

interface ClientInfoStepProps {
  data: IntakeFormData;
  onChange: <K extends keyof IntakeFormData>(field: K, value: IntakeFormData[K]) => void;
  onNext: () => void;
}

export function ClientInfoStep({ data, onChange, onNext }: ClientInfoStepProps) {
  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleNext} className="intake-form">
      <div className="intake-field">
        <label className="intake-label">CLIENT TYPE <span className="required">*</span></label>
        <select value={data.clientType} onChange={(e) => onChange("clientType", e.target.value)} required className="intake-input">
          <option value="" disabled>Select an option …</option>
          {CLIENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="intake-field">
        <label className="intake-label">CLIENT NAME <span className="required">*</span></label>
        <input
          type="text"
          value={data.clientName}
          onChange={(e) => onChange("clientName", e.target.value)}
          required
          className="intake-input"
          placeholder="Enter client name"
        />
      </div>

      <div className="intake-field">
        <label className="intake-label">INDUSTRY (IF APPLICABLE)</label>
        <input
          type="text"
          value={data.industry}
          onChange={(e) => onChange("industry", e.target.value)}
          className="intake-input"
          placeholder="Select an option …"
        />
      </div>

      <div className="intake-field">
        <label className="intake-label">PRINCIPAL/RESIDENTIAL ADDRESS <span className="required">*</span></label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => onChange("address", e.target.value)}
          required
          className="intake-input"
          placeholder="Enter complete address"
        />
      </div>

      <div className="intake-field">
        <label className="intake-label">COUNTRY</label>
        <select value={data.country} onChange={(e) => onChange("country", e.target.value)} className="intake-input">
          <option value="" disabled>Select an option …</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="intake-field">
        <label className="intake-label">NUMBER OF EMPLOYEES (IF APPLICABLE)</label>
        <select value={data.numberOfEmployees} onChange={(e) => onChange("numberOfEmployees", e.target.value)} className="intake-input">
          <option value="" disabled>Select an option …</option>
          {NUMBER_OF_EMPLOYEES_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div className="intake-field">
        <label className="intake-label">CONTACT PERSON <span className="required">*</span></label>
        <textarea
          value={data.contactPerson}
          onChange={(e) => onChange("contactPerson", e.target.value)}
          required
          rows={2}
          className="intake-input intake-textarea"
          placeholder="Name of contact person"
        />
      </div>

      <div className="intake-field">
        <label className="intake-label">DESIGNATION <span className="required">*</span></label>
        <input
          type="text"
          value={data.designation}
          onChange={(e) => onChange("designation", e.target.value)}
          required
          className="intake-input"
        />
      </div>

      <div className="intake-field">
        <label className="intake-label">CONTACT EMAIL <span className="required">*</span></label>
        <input
          type="email"
          value={data.contactEmail}
          onChange={(e) => onChange("contactEmail", e.target.value)}
          required
          className="intake-input"
          placeholder="you@example.com"
        />
      </div>

      <div className="intake-field">
        <label className="intake-label">CONTACT PHONE <span className="required">*</span></label>
        <input
          type="tel"
          value={data.contactPhone}
          onChange={(e) => onChange("contactPhone", e.target.value)}
          required
          className="intake-input"
          placeholder="09XXXXXXXXX"
        />
      </div>

      <div className="intake-actions">
        <button type="submit" className="intake-next-btn">Next</button>
      </div>
    </form>
  );
}
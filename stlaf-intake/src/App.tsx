import { useState, useEffect } from "react";
import { StepIndicator } from "./components/StepIndicator";
import { ClientInfoStep } from "./components/ClientInfoStep";
import { ServicesStep } from "./components/ServicesStep";
import { DetailsBookingStep } from "./components/DetailsBookingStep";
import { fetchCatalog, fetchFormOptions, submitIntake } from "./api/intakeApi";
import { emptyFormData, type IntakeFormData, type IntakeGroupOption, type IntakeFormOptions } from "./types/intake";
import "./App.css";

function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<IntakeFormData>(emptyFormData);
  const [groups, setGroups] = useState<IntakeGroupOption[]>([]);
  const [options, setOptions] = useState<IntakeFormOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCatalog(), fetchFormOptions()]).then(([catalogData, optionsData]) => {
      setGroups(catalogData);
      setOptions(optionsData);
      setIsLoading(false);
    });
  }, []);

  function updateField<K extends keyof IntakeFormData>(field: K, value: IntakeFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await submitIntake(formData);
      setTrackingNumber(result.trackingNumber);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Something went wrong submitting your inquiry. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !options) {
    return <div className="intake-loading">Loading…</div>;
  }

  if (trackingNumber) {
    return (
      <div className="intake-page">
        <div className="intake-card intake-success">
          <h1>Thank you!</h1>
          <p>Your inquiry has been received.</p>
          <p className="tracking-number">Tracking Number: <strong>{trackingNumber}</strong></p>
          <p>A confirmation email has been sent to {formData.contactEmail}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="intake-page">
      <div className="intake-card">
        <div className="intake-header">
          <h1>INTAKE FORM — STEP {step} OF 3</h1>
          <span className="ref-id">Ref ID: Pending Submit</span>
        </div>

        <StepIndicator currentStep={step} />

        {error && <p className="intake-error">{error}</p>}

        {step === 1 && (
          <ClientInfoStep data={formData} onChange={updateField} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <ServicesStep
            groups={groups}
            data={formData}
            onChange={updateField}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <DetailsBookingStep
            options={options}
            data={formData}
            onChange={updateField}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}

export default App;
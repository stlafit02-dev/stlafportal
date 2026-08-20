export interface IntakeServiceOption {
  id: string;
  name: string;
}

export interface IntakeGroupOption {
  id: string;
  category: string;
  name: string;
  services: IntakeServiceOption[];
}

export interface IntakeFormOptions {
  consultationPreferences: string[];
  timeSlots: string[];
  howDidYouFindUsOptions: string[];
}

export interface IntakeFormData {
  // Step 1 — Client Info
  clientType: string;
  clientName: string;
  industry: string;
  address: string;
  country: string;
  numberOfEmployees: string;
  contactPerson: string;
  designation: string;
  contactEmail: string;
  contactPhone: string;

  // Step 2 — Services Wanted
  selectedServiceIds: string[];

  // Step 3 — Details & Booking
  consultationPreference: string;
  consultationDate: string;
  preferredTimeSlots: string[];
  clientConcerns: string;
  file: File | null;
  howDidYouFindUs: string;
}

export const emptyFormData: IntakeFormData = {
  clientType: "",
  clientName: "",
  industry: "",
  address: "",
  country: "",
  numberOfEmployees: "",
  contactPerson: "",
  designation: "",
  contactEmail: "",
  contactPhone: "",
  selectedServiceIds: [],
  consultationPreference: "",
  consultationDate: "",
  preferredTimeSlots: [],
  clientConcerns: "",
  file: null,
  howDidYouFindUs: "",
};
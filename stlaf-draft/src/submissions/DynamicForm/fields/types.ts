import type { Control, UseFormRegister } from "react-hook-form";
import type { FieldDefinition, FormValues } from "../../../types/formSchema";

export interface FieldProps {
  field: FieldDefinition;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  error?: string;
}

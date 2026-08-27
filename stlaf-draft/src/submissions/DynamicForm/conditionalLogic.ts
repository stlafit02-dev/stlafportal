import type { FieldDefinition, FieldConditionalRule, FormValues } from "../../types/formSchema";

function evaluateRule(rule: FieldConditionalRule, values: FormValues): boolean {
  const actual = values[rule.field];

  switch (rule.operator) {
    case "eq":
      return actual === rule.value;
    case "neq":
      return actual !== rule.value;
    case "in":
      return (
        Array.isArray(rule.value) &&
        typeof actual === "string" &&
        rule.value.includes(actual)
      );
    case "notEmpty":
      return (
        actual !== undefined &&
        actual !== null &&
        actual !== "" &&
        !(Array.isArray(actual) && actual.length === 0)
      );
    default:
      return true;
  }
}

export function isFieldVisible(field: FieldDefinition, values: FormValues): boolean {
  if (!field.conditional) return true;
  return evaluateRule(field.conditional, values);
}

export function visibleFields(fields: FieldDefinition[], values: FormValues): FieldDefinition[] {
  return fields.filter((field) => isFieldVisible(field, values));
}

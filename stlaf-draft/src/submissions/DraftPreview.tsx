import type { FormSchema, FormValues } from "../types/formSchema";
import { visibleFields } from "./DynamicForm/conditionalLogic";
import { formatFieldValue, isFieldValueEmpty } from "./formatFieldValue";
import "./DraftPreview.css";

interface DraftPreviewProps {
  schema: FormSchema;
  values: FormValues;
  hiddenFieldKeys?: string[];
}

export function DraftPreview({ schema, values, hiddenFieldKeys = [] }: DraftPreviewProps) {
  const fields = visibleFields(schema.fields, values);

  return (
    <dl className="draft-preview">
      {fields.map((field) => {
        const hidden = hiddenFieldKeys.includes(field.key);
        const value = values[field.key];

        return (
          <div key={field.key} className="draft-preview-row">
            <dt>{field.label}</dt>
            <dd>
              {hidden ? (
                <span className="draft-answer-locked">🔒 Premium</span>
              ) : isFieldValueEmpty(value) ? (
                <span className="draft-answer-empty">—</span>
              ) : field.type === "list" ? (
                <ol className="draft-answer-list">
                  {formatFieldValue(field, value)
                    .split("\n")
                    .map((line, i) => (
                      <li key={i}>{line.replace(/^\d+\.\s*/, "")}</li>
                    ))}
                </ol>
              ) : (
                formatFieldValue(field, value)
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

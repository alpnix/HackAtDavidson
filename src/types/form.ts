import type { Tables } from "@/integrations/supabase/types";

export type FormStatus = "DRAFT" | "PUBLISHED" | "OVERDUE" | "ARCHIVED";
export type FormFieldType = "text" | "number" | "email" | "long_text";

export type Form = Tables<"forms">;
export type FormField = Tables<"form_fields">;
export type FormSubmission = Tables<"form_submissions">;

export type FormWithMeta = Form & {
  profile: { firstname: string; lastname: string } | null;
  form_fields: FormField[];
  submission_count: number;
};

export type FormSubmissionData = Record<string, string | number | null>;

export const FORM_FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "long_text", label: "Long text" },
];

export const FORM_STATUSES: { value: FormStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "ARCHIVED", label: "Archived" },
];

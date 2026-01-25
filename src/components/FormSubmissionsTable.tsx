import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { FormField, FormSubmission } from "@/types/form";
import type { FormSubmissionData } from "@/types/form";

interface FormSubmissionsTableProps {
  fields: FormField[];
  submissions: FormSubmission[];
  loading?: boolean;
}

export function FormSubmissionsTable({
  fields,
  submissions,
  loading = false,
}: FormSubmissionsTableProps) {
  const sortedFields = [...fields].sort((a, b) => a.position - b.position);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card py-12 text-center text-muted-foreground">
        Loading submissions…
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card py-12 text-center text-muted-foreground">
        No submissions yet.
      </div>
    );
  }

  const cellValue = (data: FormSubmissionData, fieldId: string): string => {
    const v = data[fieldId];
    if (v == null) return "—";
    return String(v);
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {sortedFields.map((f) => (
                <TableHead key={f.id} className="text-primary font-semibold whitespace-nowrap">
                  {f.label}
                  {f.required && (
                    <span className="text-destructive ml-0.5" aria-hidden>*</span>
                  )}
                </TableHead>
              ))}
              <TableHead className="text-primary font-semibold whitespace-nowrap w-[160px]">
                Submitted
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((s) => (
              <TableRow key={s.id} className="border-border">
                {sortedFields.map((f) => (
                  <TableCell key={f.id} className="max-w-[200px] truncate" title={cellValue(s.data as FormSubmissionData, f.id)}>
                    {cellValue(s.data as FormSubmissionData, f.id)}
                  </TableCell>
                ))}
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {format(new Date(s.created_at), "MMM d, yyyy HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

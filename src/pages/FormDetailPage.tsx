import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { authorLabel } from "@/lib/blog-utils";
import { getFormCoverUrl } from "@/lib/form-utils";
import { supabase } from "@/integrations/supabase/client";
import { FormSubmissionsTable } from "@/components/FormSubmissionsTable";
import { FormQRCode } from "@/components/FormQRCode";
import type { Form, FormField, FormSubmission } from "@/types/form";
import type { FormStatus } from "@/types/form";
import { ArrowLeft, Loader2, Link2, Upload, Archive } from "lucide-react";
import { toast } from "sonner";

interface FormWithProfile extends Form {
  profile: { firstname: string; lastname: string } | null;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  OVERDUE: "destructive",
  ARCHIVED: "outline",
};

export default function FormDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormWithProfile | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback(async (formId: string) => {
    setLoading(true);
    try {
      const { data: formData, error: formErr } = await supabase
        .from("forms")
        .select("*, profile(firstname, lastname)")
        .eq("id", formId)
        .single();
      if (formErr || !formData) throw formErr ?? new Error("Form not found");

      const { data: fieldsData, error: fieldsErr } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", formId)
        .order("position", { ascending: true });
      if (fieldsErr) throw fieldsErr;

      const { data: subsData, error: subsErr } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_id", formId)
        .order("created_at", { ascending: false });
      if (subsErr) throw subsErr;

      setForm(formData as unknown as FormWithProfile);
      setFields((fieldsData ?? []) as FormField[]);
      setSubmissions((subsData ?? []) as FormSubmission[]);
    } catch (e) {
      console.error(e);
      toast.error("Form not found");
      navigate("/dashboard/forms", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (id) fetchDetail(id);
  }, [id, fetchDetail]);

  const updateStatus = async (newStatus: FormStatus) => {
    if (!form) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("forms")
        .update({ status: newStatus })
        .eq("id", form.id);
      if (error) throw error;
      setForm((f) => (f ? { ...f, status: newStatus } : null));
      toast.success(newStatus === "PUBLISHED" ? "Form published" : "Form archived");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="relative flex flex-1 flex-col p-6">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (!form) return null;

  return (
    <main className="relative flex flex-1 flex-col p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 sharp-clip" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-accent/10 rotate-45 opacity-50" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/forms" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to forms
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {form.cover_url && (
            <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-muted">
              <img
                src={getFormCoverUrl(form.cover_url) ?? ""}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4 rounded-lg border border-border bg-card/95 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">{form.title}</h1>
              <Badge variant={statusVariant[form.status] ?? "secondary"}>
                {form.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {authorLabel(form.profile)} · {format(new Date(form.created_at), "MMM d, yyyy")}
              </span>
              {form.deadline && (
                <span className="text-sm text-muted-foreground">
                  Deadline: {format(new Date(form.deadline), "PPpp")}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {form.status === "DRAFT" && (
                <Button
                  onClick={() => updateStatus("PUBLISHED")}
                  disabled={actionLoading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Publish
                </Button>
              )}
              {form.status === "PUBLISHED" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/forms/${form.id}/submit`;
                      navigator.clipboard.writeText(url).then(
                        () => toast.success("Form link copied"),
                        () => toast.error("Failed to copy")
                      );
                    }}
                  >
                    <Link2 className="h-4 w-4 mr-1" />
                    Copy form link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus("ARCHIVED")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Archive className="h-4 w-4 mr-2" />
                    )}
                    Archive
                  </Button>
                </>
              )}
            </div>
            {form.status === "PUBLISHED" && (
              <div className="pt-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">QR code</p>
                <FormQRCode
                  submitUrl={`${window.location.origin}/forms/${form.id}/submit`}
                  formTitle={form.title}
                />
              </div>
            )}

            {form.description && (
              <p className="text-sm text-foreground/80">{form.description}</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary mb-3">Submissions</h2>
            <FormSubmissionsTable
              fields={fields}
              submissions={submissions}
              loading={false}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

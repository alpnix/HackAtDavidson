import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { getFormCoverUrl } from "@/lib/form-utils";
import type { Form as FormData, FormField } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField as HFFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FormFillProps {
  form: FormData;
  fields: FormField[];
  onSuccess?: () => void;
}

function FormFillInner({ form, fields, onSuccess }: FormFillProps) {
  const [submitting, setSubmitting] = useState(false);
  const sortedFields = [...fields].sort((a, b) => a.position - b.position);

  const defaultValues = sortedFields.reduce(
    (acc, f) => {
      acc[f.id] = "";
      return acc;
    },
    {} as Record<string, string>
  );

  const formHook = useForm<Record<string, string>>({
    defaultValues,
  });

  const onSubmit = async (values: Record<string, string>) => {
    let hasError = false;
    for (const f of sortedFields) {
      if (f.required && !(values[f.id] ?? "").trim()) {
        formHook.setError(f.id, { message: `${f.label} is required` });
        hasError = true;
      }
    }
    if (hasError) return;

    setSubmitting(true);
    try {
      const data: Record<string, string | number> = {};
      for (const f of sortedFields) {
        const v = values[f.id]?.trim();
        if (v == null || v === "") continue;
        data[f.id] = f.field_type === "number" ? Number(v) || 0 : v;
      }
      const { error } = await supabase.from("form_submissions").insert({
        form_id: form.id,
        data,
      });
      if (error) throw error;
      toast.success("Response submitted");
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...formHook}>
      <form onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-6">
        {form.cover_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
            <img
              src={getFormCoverUrl(form.cover_url) ?? ""}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="space-y-4">
          {sortedFields.map((f) => (
            <HFFormField
              key={f.id}
              control={formHook.control}
              name={f.id}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {f.label}
                    {f.required && <span className="text-destructive ml-0.5">*</span>}
                  </FormLabel>
                  <FormControl>
                    {f.field_type === "long_text" ? (
                      <Textarea
                        placeholder={f.placeholder ?? undefined}
                        className="min-h-[100px]"
                        {...field}
                        value={field.value ?? ""}
                      />
                    ) : (
                      <Input
                        type={
                          f.field_type === "number"
                            ? "number"
                            : f.field_type === "email"
                              ? "email"
                              : "text"
                        }
                        placeholder={f.placeholder ?? undefined}
                        {...field}
                        value={field.value ?? ""}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function FormFill() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      toast.error("Form not found");
      navigate("/", { replace: true });
      return;
    }
    const run = async () => {
      setLoading(true);
      try {
        const { data: formData, error: formErr } = await supabase
          .from("forms")
          .select("*")
          .eq("id", id)
          .single();
        if (formErr || !formData) {
          toast.error("Form not found");
          navigate("/", { replace: true });
          setLoading(false);
          return;
        }
        if (formData.status !== "PUBLISHED") {
          toast.error("Form not found");
          navigate("/", { replace: true });
          setLoading(false);
          return;
        }
        const now = new Date();
        if (formData.deadline && new Date(formData.deadline) < now) {
          toast.error("Form not found");
          navigate("/", { replace: true });
          setLoading(false);
          return;
        }
        const { data: fieldsData, error: fieldsErr } = await supabase
          .from("form_fields")
          .select("*")
          .eq("form_id", id)
          .order("position", { ascending: true });
        if (fieldsErr) throw fieldsErr;
        setForm(formData as FormData);
        setFields((fieldsData ?? []) as FormField[]);
      } catch (e) {
        console.error(e);
        toast.error("Form not found");
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!form) {
    return null;
  }

  return (
    <div className="container max-w-2xl py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl font-bold text-primary">{form.title}</h1>
        {form.description && (
          <p className="text-muted-foreground">{form.description}</p>
        )}
      </div>
      <FormFillInner form={form} fields={fields} onSuccess={() => navigate("/", { replace: true })} />
    </div>
  );
}

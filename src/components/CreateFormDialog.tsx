import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { FORM_FIELD_TYPES, type FormFieldType, type FormStatus } from "@/types/form";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

const fieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  field_type: z.enum(["text", "number", "email", "long_text"]),
  placeholder: z.string().optional(),
  required: z.boolean(),
});

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  deadline: z.string().optional(),
  fields: z.array(fieldSchema).min(1, "Add at least one field"),
});

type FormValues = z.infer<typeof schema>;

interface CreateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateFormDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      deadline: "",
      fields: [{ label: "", field_type: "text", placeholder: "", required: true }],
    },
  });

  const [submittingAs, setSubmittingAs] = useState<FormStatus | null>(null);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const resetCover = useCallback(() => {
    setCoverFile(null);
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!open) {
      form.reset({
        title: "",
        description: "",
        deadline: "",
        fields: [{ label: "", field_type: "text", placeholder: "", required: true }],
      });
      resetCover();
      setSubmittingAs(null);
    }
  }, [open, form, resetCover]);

  const submitWithStatus = (status: FormStatus) => {
    setSubmittingAs(status);
    form.handleSubmit((values) => onSubmit(values, status))();
  };

  const onSubmit = async (values: FormValues, status: FormStatus) => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Not signed in");
      const { data: profile, error: profileErr } = await supabase
        .from("profile")
        .select("id")
        .eq("email", user.email)
        .single();
      if (profileErr || !profile) throw new Error("Profile not found. You must have a profile to create forms.");

      const deadline = values.deadline ? new Date(values.deadline).toISOString() : null;
      let coverUrl: string | null = null;
      if (coverFile) {
        const ext = coverFile.name.split(".").pop() || "png";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("form-covers")
          .upload(path, coverFile, { cacheControl: "3600", upsert: false });
        if (uploadErr) throw new Error(uploadErr.message);
        coverUrl = path;
      }
      const { data: formRow, error: formErr } = await supabase
        .from("forms")
        .insert({
          title: values.title,
          description: values.description,
          cover_url: coverUrl,
          status,
          deadline,
          created_by: profile.id,
        })
        .select("id")
        .single();
      if (formErr || !formRow) throw formErr ?? new Error("Failed to create form");

      const formFields = values.fields.map((f, i) => ({
        form_id: formRow.id,
        position: i,
        label: f.label,
        field_type: f.field_type as FormFieldType,
        placeholder: f.placeholder || null,
        required: f.required,
      }));
      const { error: fieldsErr } = await supabase.from("form_fields").insert(formFields);
      if (fieldsErr) throw fieldsErr;

      toast.success(status === "PUBLISHED" ? "Form published" : "Form saved as draft");
      resetCover();
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create form");
    } finally {
      setSubmitting(false);
      setSubmittingAs(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-primary">Create form</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-form-form"
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Form title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the form"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Cover photo</FormLabel>
                {!coverPreview ? (
                  <div className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input p-8">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drop or click to upload</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={handleCoverChange}
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border">
                    <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={resetCover}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </FormItem>
            </div>

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline (optional)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Fields</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ label: "", field_type: "text", placeholder: "", required: true })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add field
                </Button>
              </div>
              <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                {fields.map((f, i) => (
                  <div
                    key={f.id}
                    className="flex flex-col gap-3 rounded-md border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Field {i + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => remove(i)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`fields.${i}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Field label" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`fields.${i}.field_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FORM_FIELD_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`fields.${i}.placeholder`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Placeholder (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Placeholder text" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`fields.${i}.required`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-normal">Required</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
              {form.formState.errors.fields?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.fields.message}</p>
              )}
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => submitWithStatus("DRAFT")}
            disabled={submitting}
          >
            {submitting && submittingAs === "DRAFT" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save as draft"
            )}
          </Button>
          <Button
            type="button"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => submitWithStatus("PUBLISHED")}
            disabled={submitting}
          >
            {submitting && submittingAs === "PUBLISHED" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

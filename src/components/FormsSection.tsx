import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { FormWithMeta } from "@/types/form";
import { Button } from "@/components/ui/button";
import { FormCard } from "@/components/FormCard";
import { CreateFormDialog } from "@/components/CreateFormDialog";
import { Loader2, Plus } from "lucide-react";

const formsSelect = "*, profile(firstname, lastname)";

export function FormsSection() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const { data: formsData, error: formsErr } = await supabase
        .from("forms")
        .select(formsSelect)
        .order("created_at", { ascending: false });
      if (formsErr) throw formsErr;

      const list = (formsData ?? []) as (FormWithMeta & { form_fields?: unknown })[];

      if (list.length === 0) {
        setForms([]);
        setLoading(false);
        return;
      }

      const formIds = list.map((f) => f.id);
      const { data: subs, error: subsErr } = await supabase
        .from("form_submissions")
        .select("form_id")
        .in("form_id", formIds);
      if (subsErr) throw subsErr;

      const countByForm: Record<string, number> = {};
      for (const s of subs ?? []) {
        countByForm[s.form_id] = (countByForm[s.form_id] ?? 0) + 1;
      }

      const withCounts: FormWithMeta[] = list.map((f) => ({
        ...f,
        profile: f.profile ?? null,
        form_fields: [],
        submission_count: countByForm[f.id] ?? 0,
      }));

      setForms(withCounts);
    } catch (e) {
      console.error(e);
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-primary">Forms</h2>
        <Button
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create form
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : forms.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No forms yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((f) => (
            <FormCard
              key={f.id}
              form={f}
              onClick={() => navigate(`/dashboard/forms/${f.id}`)}
            />
          ))}
        </div>
      )}

      <CreateFormDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={fetchForms} />
    </div>
  );
}

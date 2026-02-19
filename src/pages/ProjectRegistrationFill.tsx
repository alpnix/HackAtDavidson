import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

type Registration = Tables<"registrations">;

const SETTING_PROJECT_REGISTRATION_OPEN = "PROJECT_REGISTRATION_OPEN";

export default function ProjectRegistrationFill() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [hackathonId, setHackathonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [memberSearchOpen, setMemberSearchOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Registration[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyRegistrationIds, setBusyRegistrationIds] = useState<Set<string>>(new Set());
  const [memberLabels, setMemberLabels] = useState<Record<string, string>>({});
  const hackathonIdRef = useRef<string | null>(null);
  hackathonIdRef.current = hackathonId;

  const form = useForm<{ projectName: string; memberIds: string[] }>({
    defaultValues: { projectName: "", memberIds: [] },
  });
  const memberIds = form.watch("memberIds");

  // Fetch setting and current hackathon
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [settingRes, hackRes] = await Promise.all([
          supabase
            .from("settings")
            .select("value, value_type")
            .eq("name", SETTING_PROJECT_REGISTRATION_OPEN)
            .maybeSingle(),
          supabase
            .from("hackathons")
            .select("id")
            .order("year", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);
        if (cancelled) return;
        if (settingRes.error) throw settingRes.error;
        if (hackRes.error) throw hackRes.error;
        const open =
          settingRes.data?.value_type === "boolean" && settingRes.data?.value === "true";
        setAllowed(open);
        setHackathonId(hackRes.data?.id ?? null);
      } catch (e) {
        console.error(e);
        setAllowed(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch registration IDs that are already in a project for current hackathon
  const refreshBusyIds = useCallback(async (hackId: string | null) => {
    if (!hackId) {
      setBusyRegistrationIds(new Set());
      return;
    }
    const { data: projects } = await supabase
      .from("projects")
      .select("id")
      .eq("hackathon_id", hackId);
    if (!projects?.length) {
      setBusyRegistrationIds(new Set());
      return;
    }
    const { data: members } = await supabase
      .from("project_members")
      .select("registration_id")
      .in("project_id", projects.map((p) => p.id));
    setBusyRegistrationIds(
      new Set((members ?? []).map((m) => m.registration_id))
    );
  }, []);

  useEffect(() => {
    refreshBusyIds(hackathonId);
  }, [hackathonId, refreshBusyIds]);

  // Realtime: refetch busy registration IDs when project_members change (any user adding/removing)
  useEffect(() => {
    if (!hackathonId) return;
    const channel = supabase
      .channel("project_members_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_members",
        },
        () => {
          refreshBusyIds(hackathonIdRef.current);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [hackathonId, refreshBusyIds]);

  // Search registrations by name or email
  useEffect(() => {
    if (!memberQuery.trim()) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const term = `%${memberQuery.trim()}%`;
    supabase
      .from("registrations")
      .select("id, first_name, last_name, email")
      .or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`)
      .limit(20)
      .then(({ data, error }) => {
        if (cancelled) return;
        setSearching(false);
        if (error) {
          setSearchResults([]);
          return;
        }
        setSearchResults((data ?? []) as Registration[]);
      });
    return () => {
      cancelled = true;
    };
  }, [memberQuery]);

  const availableResults = searchResults.filter(
    (r) => !busyRegistrationIds.has(r.id) && !memberIds.includes(r.id)
  );

  const onSubmit = async (values: { projectName: string; memberIds: string[] }) => {
    const name = values.projectName?.trim();
    if (!name) {
      form.setError("projectName", { message: "Project name is required" });
      return;
    }
    if (!hackathonId) {
      toast.error("No hackathon is configured.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: project, error: projectErr } = await supabase
        .from("projects")
        .insert({ hackathon_id: hackathonId, name })
        .select("id")
        .single();
      if (projectErr || !project) throw projectErr ?? new Error("Failed to create project");

      if (values.memberIds.length > 0) {
        const { error: membersErr } = await supabase.from("project_members").insert(
          values.memberIds.map((registration_id) => ({
            project_id: project.id,
            registration_id,
          }))
        );
        if (membersErr) throw membersErr;
      }
      toast.success("Project registered successfully.");
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to register project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (allowed === false) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <h1 className="text-xl font-semibold text-primary">Project registration is closed</h1>
          <p className="text-muted-foreground mt-2">
            Check back later or contact the organizers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl font-bold text-primary">Register your project</h1>
        <p className="text-muted-foreground">
          Enter your project name and add team members by searching registered participants.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project name</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Project" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memberIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team members</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Popover open={memberSearchOpen} onOpenChange={setMemberSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-muted-foreground font-normal"
                        >
                          <Search className="mr-2 h-4 w-4" />
                          Search by name or email…
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search name or email…"
                            value={memberQuery}
                            onValueChange={setMemberQuery}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {searching ? "Searching…" : memberQuery.trim() ? "No one found or already in a project." : "Type to search."}
                            </CommandEmpty>
                            <CommandGroup>
                              {availableResults.map((r) => (
                                <CommandItem
                                  key={r.id}
                                  value={r.id}
                                  onSelect={() => {
                                    form.setValue("memberIds", [...field.value, r.id]);
                                    setMemberLabels((prev) => ({
                                      ...prev,
                                      [r.id]: `${r.first_name} ${r.last_name}`,
                                    }));
                                    setMemberQuery("");
                                    setMemberSearchOpen(false);
                                  }}
                                >
                                  {r.first_name} {r.last_name} ({r.email})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((id) => {
                          const label = memberLabels[id] ?? id.slice(0, 8);
                          return (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="gap-1 pr-1"
                            >
                              {label}
                              <button
                                type="button"
                                className="rounded-full hover:bg-muted"
                                onClick={() =>
                                  form.setValue(
                                    "memberIds",
                                    field.value.filter((x) => x !== id)
                                  )
                                }
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
              "Register project"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

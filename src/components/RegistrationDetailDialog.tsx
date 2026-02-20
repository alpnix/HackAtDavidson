import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRole } from "@/lib/constants";
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Shirt,
  Plane,
  UtensilsCrossed,
  FileText,
  CheckCircle2,
  XCircle,
  LogIn,
  Loader2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

type Registration = Tables<"registrations">;

function formatLevel(s: string): string {
  const map: Record<string, string> = {
    "high-school": "High School",
    "undergraduate-freshman": "Undergraduate – Freshman",
    "undergraduate-sophomore": "Undergraduate – Sophomore",
    "undergraduate-junior": "Undergraduate – Junior",
    "undergraduate-senior": "Undergraduate – Senior",
    graduate: "Graduate",
    other: "Other",
  };
  return map[s] ?? s;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-primary">{title}</h4>
      <div className="rounded-lg border border-border bg-muted/30 p-4">{children}</div>
    </div>
  );
}

interface RegistrationDetailDialogProps {
  registration: Registration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistrationUpdated?: (updated: Registration) => void;
}

export function RegistrationDetailDialog({
  registration,
  open,
  onOpenChange,
  onRegistrationUpdated,
}: RegistrationDetailDialogProps) {
  const [checkingIn, setCheckingIn] = useState(false);

  if (!registration) return null;

  const r = registration;

  const handleCheckIn = async () => {
    if (!!r.checked_in) return;
    setCheckingIn(true);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq("id", r.id)
        .select()
        .single();
      if (error) throw error;
      if (data) onRegistrationUpdated?.(data as Registration);
    } finally {
      setCheckingIn(false);
    }
  };
  const dietary = r.dietary_restrictions?.filter((x) => x && x !== "none") ?? [];
  const country = r.country_other && r.country_of_residence === "Other"
    ? r.country_other
    : r.country_of_residence;
  const school = r.school_other && r.school === "Other" ? r.school_other : r.school;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl border-border bg-card p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-xl text-primary">
            {r.first_name} {r.last_name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{r.email}</p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Badge
              variant={!!r.checked_in ? "default" : "secondary"}
              className={!!r.checked_in ? "bg-primary" : ""}
            >
              {r.checked_in ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Checked in
                </>
              ) : (
                "Not checked in"
              )}
            </Badge>
            {r.checked_in_at && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(r.checked_in_at), "PPp")}
              </span>
            )}
            <Button
              size="sm"
              disabled={!!r.checked_in || checkingIn}
              onClick={handleCheckIn}
              className="ml-auto"
            >
              {checkingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Check in
                </>
              )}
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh] max-h-[calc(90vh-140px)]">
          <div className="space-y-6 px-6 py-4">
            <Section title="Contact">
              <DetailRow icon={Mail} label="Email" value={r.email} />
              <DetailRow icon={Phone} label="Phone" value={r.phone_number} />
            </Section>

            <Section title="School & study">
              <DetailRow icon={GraduationCap} label="School" value={school} />
              <DetailRow
                icon={GraduationCap}
                label="Level of study"
                value={formatLevel(r.level_of_study)}
              />
              <DetailRow icon={MapPin} label="Country" value={country} />
            </Section>

            <Section title="Logistics">
              <DetailRow icon={Shirt} label="T-shirt" value={r.tshirt_size.toUpperCase()} />
              <DetailRow
                icon={Plane}
                label="Airport transportation"
                value={formatRole(r.airport_transportation)}
              />
              <DetailRow icon={Mail} label="Age" value={String(r.age)} />
            </Section>

            {(dietary.length > 0 || r.allergies_detail || r.other_accommodations) && (
              <Section title="Dietary & accommodations">
                {dietary.length > 0 && (
                  <DetailRow
                    icon={UtensilsCrossed}
                    label="Dietary"
                    value={
                      <span className="flex flex-wrap gap-1">
                        {dietary.map((d) => (
                          <Badge key={d} variant="secondary" className="font-normal">
                            {d}
                          </Badge>
                        ))}
                      </span>
                    }
                  />
                )}
                <DetailRow icon={UtensilsCrossed} label="Allergies" value={r.allergies_detail} />
                <DetailRow
                  icon={UtensilsCrossed}
                  label="Other accommodations"
                  value={r.other_accommodations}
                />
              </Section>
            )}

            <Section title="MLH & policies">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={r.mlh_code_of_conduct ? "default" : "secondary"}
                  className={r.mlh_code_of_conduct ? "bg-primary" : ""}
                >
                  {r.mlh_code_of_conduct ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : (
                    <XCircle className="mr-1 h-3 w-3" />
                  )}
                  Code of Conduct
                </Badge>
                <Badge
                  variant={r.mlh_event_logistics ? "default" : "secondary"}
                  className={r.mlh_event_logistics ? "bg-primary" : ""}
                >
                  {r.mlh_event_logistics ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : (
                    <XCircle className="mr-1 h-3 w-3" />
                  )}
                  Event logistics
                </Badge>
                <Badge
                  variant={r.mlh_marketing ? "default" : "secondary"}
                  className={r.mlh_marketing ? "bg-primary" : ""}
                >
                  {r.mlh_marketing ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : (
                    <XCircle className="mr-1 h-3 w-3" />
                  )}
                  Marketing
                </Badge>
                <Badge
                  variant={r.discord_joined ? "default" : "secondary"}
                  className={r.discord_joined ? "bg-primary" : ""}
                >
                  {r.discord_joined ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : (
                    <XCircle className="mr-1 h-3 w-3" />
                  )}
                  Discord
                </Badge>
              </div>
            </Section>

            {(r.resume_url || r.additional_notes || r.parental_consent != null) && (
              <Section title="Additional">
                {r.resume_url && (
                  <DetailRow
                    icon={FileText}
                    label="Resume"
                    value={<span className="text-primary underline">Uploaded</span>}
                  />
                )}
                <DetailRow icon={FileText} label="Notes" value={r.additional_notes} />
                {r.parental_consent != null && (
                  <DetailRow
                    icon={CheckCircle2}
                    label="Parental consent"
                    value={r.parental_consent ? "Yes" : "No"}
                  />
                )}
              </Section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

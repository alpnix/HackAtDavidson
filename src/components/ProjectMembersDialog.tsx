import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type Registration = Tables<"registrations">;

interface ProjectMembersDialogProps {
  projectId: string | null;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectMembersDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ProjectMembersDialogProps) {
  const [members, setMembers] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !projectId) {
      setMembers([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: rows, error } = await supabase
        .from("project_members")
        .select("registration_id")
        .eq("project_id", projectId);
      if (cancelled || error) {
        if (!cancelled && error) setMembers([]);
        setLoading(false);
        return;
      }
      const ids = (rows ?? []).map((r) => r.registration_id).filter(Boolean);
      if (ids.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }
      const { data: regs, error: regErr } = await supabase
        .from("registrations")
        .select("id, first_name, last_name, email")
        .in("id", ids);
      if (cancelled) return;
      if (regErr) setMembers([]);
      else setMembers((regs ?? []) as Registration[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Members — {projectName}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No members yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.first_name} {r.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

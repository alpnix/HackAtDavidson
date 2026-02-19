import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { FormQRCode } from "@/components/FormQRCode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectMembersDialog } from "@/components/ProjectMembersDialog";
import { Link2, Loader2, Lock, Unlock, Users } from "lucide-react";
import { toast } from "sonner";

type Project = Tables<"projects">;

const SETTING_PROJECT_REGISTRATION_OPEN = "PROJECT_REGISTRATION_OPEN";

export function ProjectRegistrationSection() {
  const [open, setOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<(Project & { member_count: number })[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchSetting = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value, value_type")
        .eq("name", SETTING_PROJECT_REGISTRATION_OPEN)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setOpen(false);
        return;
      }
      setOpen(
        data.value_type === "boolean"
          ? data.value === "true"
          : false
      );
    } catch (e) {
      console.error(e);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const { data: hackData, error: hackErr } = await supabase
        .from("hackathons")
        .select("id")
        .order("year", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (hackErr || !hackData) {
        setProjects([]);
        setProjectsLoading(false);
        return;
      }
      const { data: projs, error: projErr } = await supabase
        .from("projects")
        .select("id, created_at, hackathon_id, name")
        .eq("hackathon_id", hackData.id)
        .order("created_at", { ascending: false });
      if (projErr || !projs?.length) {
        setProjects([]);
        setProjectsLoading(false);
        return;
      }
      const ids = (projs as Project[]).map((p) => p.id);
      const { data: members } = await supabase
        .from("project_members")
        .select("project_id")
        .in("project_id", ids);
      const countByProject: Record<string, number> = {};
      for (const m of members ?? []) {
        countByProject[m.project_id] = (countByProject[m.project_id] ?? 0) + 1;
      }
      setProjects(
        (projs as Project[]).map((p) => ({
          ...p,
          member_count: countByProject[p.id] ?? 0,
        }))
      );
    } catch (e) {
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSetting();
  }, [fetchSetting]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const submitUrl = `${window.location.origin}/project-registration/submit`;

  const openMembers = (project: Project) => {
    setSelectedProject(project);
    setMembersDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-primary">Project registration</h2>
        <Badge variant={open ? "default" : "secondary"}>
          {open ? (
            <>
              <Unlock className="h-3 w-3 mr-1" />
              Open
            </>
          ) : (
            <>
              <Lock className="h-3 w-3 mr-1" />
              Closed
            </>
          )}
        </Badge>
      </div>
      <Card className="border-border bg-card/95">
        <CardHeader>
          <CardTitle className="text-primary">Share registration link</CardTitle>
          <CardDescription>
            Copy the link or use the QR code so participants can submit their project and team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(submitUrl).then(
                () => toast.success("Link copied"),
                () => toast.error("Failed to copy")
              );
            }}
          >
            <Link2 className="h-4 w-4 mr-1" />
            Copy project registration link
          </Button>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">QR code</p>
            <FormQRCode
              submitUrl={submitUrl}
              formTitle="Project registration"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/95">
        <CardHeader>
          <CardTitle className="text-primary">Registered projects</CardTitle>
          <CardDescription>
            Projects for the current hackathon. Click “View members” to see team members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No projects registered yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="w-[120px]">Members</TableHead>
                  <TableHead className="w-[140px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.member_count} {p.member_count === 1 ? "member" : "members"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openMembers(p)}
                        className="text-primary"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        View members
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProjectMembersDialog
        projectId={selectedProject?.id ?? null}
        projectName={selectedProject?.name ?? ""}
        open={membersDialogOpen}
        onOpenChange={setMembersDialogOpen}
      />
    </div>
  );
}

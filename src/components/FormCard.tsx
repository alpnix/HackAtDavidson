import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { authorLabel } from "@/lib/blog-utils";
import { getFormCoverUrl } from "@/lib/form-utils";
import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormWithMeta } from "@/types/form";

interface FormCardProps {
  form: FormWithMeta;
  onClick?: () => void;
  className?: string;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  OVERDUE: "destructive",
  ARCHIVED: "outline",
};

export function FormCard({ form, onClick, className }: FormCardProps) {
  const coverUrl = getFormCoverUrl(form.cover_url ?? null);

  return (
    <Card
      className={cn(
        "overflow-hidden border-border bg-card transition-shadow hover:shadow-md cursor-pointer hover:shadow-lg",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <FileQuestion className="h-12 w-12" />
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-primary line-clamp-2 flex-1">{form.title}</h3>
          <Badge variant={statusVariant[form.status] ?? "secondary"} className="shrink-0">
            {form.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {authorLabel(form.profile)} · {format(new Date(form.created_at), "MMM d, yyyy")}
        </p>
        <p className="text-sm text-foreground/80 line-clamp-2">
          {form.description || "No description"}
        </p>
        <p className="text-xs text-muted-foreground">
          {form.submission_count} submission{form.submission_count !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}

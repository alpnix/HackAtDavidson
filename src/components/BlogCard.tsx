import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getCoverUrl, authorLabel, stripHtml } from "@/lib/blog-utils";
import { supabase } from "@/integrations/supabase/client";
import { Archive, ImageOff, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogWithCreator } from "@/types/blog";

interface BlogCardProps {
  blog: BlogWithCreator;
  onArchive?: (blog: BlogWithCreator) => void;
  className?: string;
}

export function BlogCard({ blog, onArchive, className }: BlogCardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const coverUrl = getCoverUrl(blog.cover_url);
  const preview = stripHtml(blog.content, 120);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const showActions = isLoggedIn;

  return (
    <Link to={`/blog/${blog.id}`} className="block">
      <Card
        className={cn(
          "overflow-hidden border-border bg-card transition-shadow hover:shadow-md cursor-pointer hover:shadow-lg",
          className
        )}
      >
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-12 w-12" />
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-primary line-clamp-2 flex-1">{blog.title}</h3>
            {blog.archived && (
              <Badge variant="secondary" className="shrink-0">
                <Archive className="mr-1 h-3 w-3" />
                Archived
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-1">
            <span>{authorLabel(blog.profile)} · {format(new Date(blog.created_at), "MMM d, yyyy")}</span>
            {blog.view_count != null && (
              <span className="inline-flex items-center gap-1">
                <span>·</span>
                <Eye className="h-3 w-3 shrink-0" />
                <span>{blog.view_count} views</span>
              </span>
            )}
          </p>
          <p className="text-sm text-foreground/80 line-clamp-2">{preview}</p>
          {showActions && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onArchive?.(blog);
              }}
              className="mt-2 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              {blog.archived ? "Unarchive" : "Archive"}
            </button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

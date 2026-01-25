import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { BlogWithCreator } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { getCoverUrl, authorLabel } from "@/lib/blog-utils";
import { UpdateBlogDialog } from "../components/UpdateBlogDialog";
import { format } from "date-fns";
import {
  ArrowLeft,
  Archive,
  ImageOff,
  Loader2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

const blogSelect = "*, profile(firstname, lastname)";

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogWithCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchBlog = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select(blogSelect)
        .eq("id", id)
        .single();
      if (error) throw error;
      setBlog(data as unknown as BlogWithCreator);
    } catch (e) {
      console.error(e);
      toast.error("Blog not found");
      navigate("/blog", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;
      setIsAuthenticated(true);
      const { data: profile } = await supabase
        .from("profile")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();
      if (profile) setCurrentProfileId(profile.id);
    };
    loadProfile();
  }, []);

  const handleArchive = async () => {
    if (!blog) return;
    setArchiving(true);
    try {
      const { error } = await supabase
        .from("blogs")
        .update({ archived: !blog.archived })
        .eq("id", blog.id);
      if (error) throw error;
      toast.success(blog.archived ? "Blog unarchived" : "Blog archived");
      await fetchBlog();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setArchiving(false);
    }
  };

  const isCreator = !!(
    blog &&
    currentProfileId &&
    blog.created_by === currentProfileId
  );

  if (loading || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const coverUrl = getCoverUrl(blog.cover_url);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              {isCreator && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpdateOpen(true)}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Update
                </Button>
              )}
              <Button
                variant="destructive"
                size="default"
                onClick={handleArchive}
                disabled={archiving}
                className="gap-2"
              >
                {archiving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {blog.archived ? "Unarchive" : "Archive"}
              </Button>
            </div>
          )}
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted mb-8">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-16 w-16" />
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          {blog.title}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {authorLabel(blog.profile)} · {format(new Date(blog.created_at), "MMMM d, yyyy")}
        </p>
        <div
          className="prose prose-sm mt-8 max-w-none prose-headings:text-primary prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>

      <UpdateBlogDialog
        blog={blog}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onSuccess={() => {
          setUpdateOpen(false);
          fetchBlog();
        }}
      />
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import type { BlogWithCreator } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { getCoverUrl, authorLabel, stripHtml } from "@/lib/blog-utils";
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
import { SITE_CONFIG, getCanonicalUrl, getBlogPostingStructuredData } from "@/lib/seo";

const blogSelect = "id, title, cover_url, content, created_by, archived, created_at, updated_at, profile(firstname, lastname)";

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
    if (!id || !blog) return;
    const key = "blog_views";
    try {
      const viewed = JSON.parse(sessionStorage.getItem(key) ?? "[]") as string[];
      if (viewed.includes(id)) return;
      supabase.rpc("increment_blog_view_count", { blog_id: id }).then(() => {
        sessionStorage.setItem(key, JSON.stringify([...viewed, id]));
      });
    } catch {
      supabase.rpc("increment_blog_view_count", { blog_id: id });
    }
  }, [id, blog?.id]);

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
  const description = stripHtml(blog.content, 160);
  const blogUrl = getCanonicalUrl(`/blog/${blog.id}`);
  const defaultImage = getCanonicalUrl(SITE_CONFIG.ogImage);
  const ogImage = coverUrl || defaultImage;
  const authorName = authorLabel(blog.profile);
  const blogStructuredData = getBlogPostingStructuredData(blog);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{blog.title} | {SITE_CONFIG.name}</title>
        <meta name="title" content={blog.title} />
        <meta name="description" content={description} />
        <meta name="author" content={authorName} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={blogUrl} />

        {/* Article Meta Tags */}
        <meta property="article:published_time" content={blog.created_at} />
        <meta property="article:modified_time" content={blog.created_at} />
        <meta property="article:author" content={authorName} />
        <meta property="article:section" content="Technology" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={blogUrl} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={SITE_CONFIG.name} />
        <meta property="og:locale" content={SITE_CONFIG.locale} />
        {coverUrl && (
          <>
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
        <meta name="twitter:creator" content={SITE_CONFIG.twitterHandle} />
        <meta name="twitter:url" content={blogUrl} />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        {coverUrl && <meta name="twitter:image:alt" content={blog.title} />}

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(blogStructuredData)}
        </script>
      </Helmet>
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

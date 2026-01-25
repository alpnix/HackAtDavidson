import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BlogWithCreator } from "@/types/blog";
import { BlogCard } from "@/components/BlogCard";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

const blogSelect = "*, profile(firstname, lastname)";

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogWithCreator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select(blogSelect)
        .eq("archived", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBlogs((data ?? []) as unknown as BlogWithCreator[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Blog
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stories and updates from the Hack@Davidson team.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : blogs.length === 0 ? (
          <p className="py-24 text-center text-muted-foreground">
            No posts yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((b) => (
              <BlogCard key={b.id} blog={b} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

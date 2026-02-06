import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BlogWithCreator } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogCard } from "@/components/BlogCard";
import { CreateBlogDialog } from "@/components/CreateBlogDialog";
import { Loader2, Plus } from "lucide-react";

const blogSelect = "*, profile(firstname, lastname)";

export function BlogSection() {
  const [displayed, setDisplayed] = useState<BlogWithCreator[]>([]);
  const [archived, setArchived] = useState<BlogWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data: displayedData, error: e1 } = await supabase
        .from("blogs")
        .select(blogSelect)
        .eq("archived", false)
        .order("created_at", { ascending: false });
      if (e1) throw e1;

      const { data: archivedData, error: e2 } = await supabase
        .from("blogs")
        .select(blogSelect)
        .eq("archived", true)
        .order("created_at", { ascending: false });
      if (e2) throw e2;

      setDisplayed((displayedData ?? []) as unknown as BlogWithCreator[]);
      setArchived((archivedData ?? []) as unknown as BlogWithCreator[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleArchive = async (blog: BlogWithCreator) => {
    try {
      const { error } = await supabase
        .from("blogs")
        .update({ archived: !blog.archived })
        .eq("id", blog.id);
      if (error) throw error;
      await fetchBlogs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-primary">Blog posts</h2>
        <Button
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add new
        </Button>
      </div>

      <Tabs defaultValue="displayed" className="space-y-4">
        <TabsList className="bg-muted/80 p-1 rounded-lg">
          <TabsTrigger
            value="displayed"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
          >
            Displayed
          </TabsTrigger>
          <TabsTrigger
            value="archived"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
          >
            Archived
          </TabsTrigger>
        </TabsList>
        <TabsContent value="displayed" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : displayed.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No displayed blogs yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayed.map((b) => (
                <BlogCard key={b.id} blog={b} onArchive={handleArchive} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="archived" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : archived.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No archived blogs.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {archived.map((b) => (
                <BlogCard key={b.id} blog={b} onArchive={handleArchive} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateBlogDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchBlogs}
      />
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import type { BlogWithCreator } from "@/types/blog";
import { BlogCard } from "@/components/BlogCard";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { SITE_CONFIG, getCanonicalUrl, getBlogStructuredData } from "@/lib/seo";


export default function Blog() {
  const [blogs, setBlogs] = useState<BlogWithCreator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
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

  const canonicalUrl = getCanonicalUrl("/blog");
  const ogImage = getCanonicalUrl(SITE_CONFIG.ogImage);
  const blogData = getBlogStructuredData();

  return (
    <div className="min-h-screen">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Blog | {SITE_CONFIG.name}</title>
        <meta name="title" content={`Blog | ${SITE_CONFIG.name}`} />
        <meta name="description" content="Stories and updates from the Hack@Davidson team. Read about our hackathon, events, and community." />
        <meta name="keywords" content="hackathon blog, Davidson College, tech stories, hackathon updates, student technology" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`Blog | ${SITE_CONFIG.name}`} />
        <meta property="og:description" content="Stories and updates from the Hack@Davidson team" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={SITE_CONFIG.name} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={`Blog | ${SITE_CONFIG.name}`} />
        <meta name="twitter:description" content="Stories and updates from the Hack@Davidson team" />
        <meta name="twitter:image" content={ogImage} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(blogData)}
        </script>
      </Helmet>
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
